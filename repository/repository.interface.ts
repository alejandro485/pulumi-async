import { CountryPersistence } from './country.persistence';

export interface RepositoryInterface {
    connect(): Promise<void>;
    getAllCountries(): Promise<CountryPersistence[]>;
    disconnect(): Promise<void>;
}