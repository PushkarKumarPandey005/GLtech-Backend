import app from './src/app.js'

import config from './src/config/config.js'
import database from './src/db/db.js'

const PORT = config.PORT || 8000

app.listen(PORT,()=>{
     database();
    

    console.log(`Server is running on port No ${PORT}`)
})