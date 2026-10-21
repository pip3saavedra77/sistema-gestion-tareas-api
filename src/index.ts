import app from './app';
import Config from './config/config';

const config = Config.getInstance();

app.listen(config.port, () => {
    console.log(`Servidor escuchando en http://localhost:${config.port}`);
});

