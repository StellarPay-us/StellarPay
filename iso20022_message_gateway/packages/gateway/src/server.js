const app = require('./app');
const port = 3010;

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});