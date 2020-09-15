const express = require('express');
const router = express.Router();
const {getClient, downloadKubeConf, cleanUpPath} = require('../../websocket');

/**
 * Get Specific Info Object
 * @swagger
 * /config/{uuid}:
 *     get:
 *         summary: Object with basic user and runtime info of a specific client
 *         parameters:
 *             - name: "uuid"
 *               in: "path"
 *               description: "Client ID"
 *               required: true
 *               type: "string"
 *         responses:
 *             200:
 *                 description: Ok
 *                 content:
 *                     application/json:
 *                         schema:
 *                             $ref: "#/components/schemas/info"
 *             400:
 *                 description: Bad Request
 *                 content: {}
 *             401:
 *                 description: Unauthorized
 *                 content: {}
 *             408:
 *                 description: Request Timeout
 *                 content: {}
 *
 *
 */
router.get('/:uuid', function (req, res) {
    const client = getClient(req.params.uuid);
    if (!client) {
        console.log("Client not Found");
        res.status(400).json({
            message: 'uuid invalid'
        });
        return;
    } else if (client.setup == null) {
        console.log("Client has not run setup yet");
        res.status(400).json({
            message: 'setup has not run yet'
        });
        return;
    }

    const kubeConfigPath = downloadKubeConf(client);
    res.on('finish', () => {
        cleanUpPath(null, kubeConfigPath, ['kubeconfig']);
    });
    res.download(`${kubeConfigPath}/kubeconfig`);
    // res.end();

    //cleanUpPath(null, kubeConfigPath, ['kubeconfig']);
});

module.exports = router;
