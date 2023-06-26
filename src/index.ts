import {app} from './app'
import dotenv from 'dotenv'
import DBconnect from './dataflow/mongodb/DBconnect'
dotenv.config()

const Start = () => {
    const PORT = process.env.PORT || 3000
    try {
        DBconnect()
        app.listen(PORT, () => {
            console.log('server is running on port ' + PORT)
        })
    } catch(e) {
        console.log(e)
    }
}

Start()