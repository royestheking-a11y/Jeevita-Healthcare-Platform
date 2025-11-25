let app;
let connectDB;

module.exports = async (req, res) => {
    try {
        if (!app) {
            // Import the server module
            const serverModule = await import('../server/server.js');
            app = serverModule.default;

            // Import and call connectDB
            const dbModule = await import('../server/config/database.js');
            connectDB = dbModule.connectDB;
        }

        // Ensure database connection before handling request
        await connectDB();

        // Handle the request
        return app(req, res);
    } catch (error) {
        console.error('Serverless function error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};
