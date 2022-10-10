import cakebase from 'cakebase';
import { RepositoryInterface } from './repository.interface';
import { CountryPersistence } from './country.persistence';
import * as path from 'path';

export class CakebaseRepository implements RepositoryInterface {
    private countryCollection: any;

    async connect() {
        this.countryCollection = cakebase(path.join(process.cwd(), '/cakebase/countries.json'));
    }

    async getAllCountries() {
        const countries: CountryPersistence[] = await this.countryCollection.get(() => true);
        return countries
    }

    async disconnect() {
        if (this.countryCollection) {
            // do something
        }
    }

}
