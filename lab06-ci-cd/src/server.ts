import {app} from "./app";
import {env} from "./config/env";
import {connectDB, disconnectDB} from "./config/database";

const startServer = async () => {
    try {
        await connectDB();

        app.listen(env.PORT, () => {
            console.log(`Server running at ${env.BASE_URL}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

process.on("SIGTERM", async () => {
    console.log("SIGTERM received. Shutting down gracefully...");

    await disconnectDB();
    process.exit(0);
});

startServer().then();

