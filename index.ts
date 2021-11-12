import { config } from 'dotenv';
config();

import * as pulumi from '@pulumi/pulumi';
import * as gcp from '@pulumi/gcp';
import { MongoClient } from 'mongodb';

export = async () => {
    const schedules: gcp.cloudscheduler.Job[] = [];

    const client = new MongoClient(`${process.env.DB_MONGO_CONNECTION}`);

    await client.connect();
    const database = client.db('pharol-dev');
    const configCountry = database.collection('configCountry');
    const countries = await configCountry.find({
        status: true,
    }).toArray();

    for(const country of countries) {
        schedules.push(new gcp.cloudscheduler.Job(`schedule-job/sitemap/${country.code}`, {
            name: `sitemap-${country.code}`.toLowerCase(),
            schedule: '0 10 * * 0',
            timeZone: country.code_timezone,
            attemptDeadline: '540s',
            region: 'us-central1',
            httpTarget: {
                httpMethod: 'GET',
                uri: `${process.env.FUNCTION_SITEMAP}/${country.code}`,
            },
            retryConfig: {
                retryCount: 1,
                minBackoffDuration: '5s',
                maxBackoffDuration: '30s',
            },
        }));
    }

    await client.close();

    return {
        schedules_sitemap: schedules.map(sch => sch.name),
    };
};
