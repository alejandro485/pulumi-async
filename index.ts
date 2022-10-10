import { config } from 'dotenv';
config();

import { RepositoryFactory } from './repository/repository.factory';
import * as gcp from '@pulumi/gcp';

export = async () => {
    const schedules: gcp.cloudscheduler.Job[] = [];

    const repository = RepositoryFactory.getRepository();
    await repository.connect();
    const countries = await repository.getAllCountries();
    await repository.disconnect();

    const exampleFuntion = await gcp.cloudfunctions.getFunction({
        name: 'function-us-central1',
        region: 'us-central1'
    })

    for(const country of countries) {
        schedules.push(new gcp.cloudscheduler.Job(`schedule-job/sitemap/${country.name}`, {
            name: `sch-query-${country.name}`.toLowerCase(),
            schedule: '0 10 * * 0',
            timeZone: country.default_timezone,
            attemptDeadline: '10s',
            region: 'us-central1',
            httpTarget: {
                httpMethod: 'GET',
                uri: `${exampleFuntion.httpsTriggerUrl}?country=${country.name}`,
            },
            retryConfig: {
                retryCount: 1,
                minBackoffDuration: '5s',
                maxBackoffDuration: '30s',
            },
        }));
    }

    return {
        schedules_sitemap: schedules.map(sch => sch.name),
    };
};
