import serverless from 'serverless-http';
import app from '../../server/app.js';

const serverlessHandler = serverless(app