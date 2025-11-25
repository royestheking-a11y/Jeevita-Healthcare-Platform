let app;

module.exports = async (req, res) => {
    if (!app) {
        const module = await import('../server/server.js');
        app = module.default;
    }
    return app(req, res);
};
