
module.exports = async (req, res) => {
    const { default: app } = await import('../server/server.js');
    app(req, res);
};
