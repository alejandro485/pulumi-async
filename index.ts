import { config } from 'dotenv';
config();

import { RepositoryFactory } from './repository/repository.factory';
import * as gcp from '@pulumi/gcp';

export = async () => {

    const repository = RepositoryFactory.getRepository();
    await repository.connect();
    const countries = await repository.getAllCountries();
    await repository.disconnect();

    const exampleFuntion = await gcp.cloudfunctions.getFunction({
        name: 'function-us-central1',
        region: 'us-central1'
    });

    const permissionsList = [{
        service: 'cloudscheduler.googleapis.com',
        name: 'cloud-scheduler',
    }];

    const permissions = permissionsList.map(permission =>
        new gcp.projects.Service(`api/${permission.name}`, {
            service: permission.service,
        })
    );

    const schedules = countries.map((country) =>
        new gcp.cloudscheduler.Job(`schedule/job/${country.name}`, {
            name: `sch-query-${country.name}`.toLowerCase(),
            schedule: '0 10 * * 0',
            timeZone: country.default_timezone,
            attemptDeadline: '15s',
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
        }, {
            dependsOn: [permissions[0]],
        })
    );

    return {
        schedules: schedules.map(sch => sch.name),
        permissions: permissions.map(per => per.service),
    };
};
