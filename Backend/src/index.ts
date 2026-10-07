import app from "./app";
import { config } from "./config/config";
import { initGeo } from "./lib/geo";

await initGeo();
app.listen(config.PORT, () => {
  console.log(`Server is running on port ${config.PORT}`);
});

export default app;
