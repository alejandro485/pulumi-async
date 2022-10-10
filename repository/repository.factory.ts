import { RepositoryInterface } from './repository.interface';
import { CakebaseRepository } from './cakebase.repository';

export class RepositoryFactory {
    static getRepository(): RepositoryInterface {
        try {
            switch(process.env.REPOSITORY) {
                case 'cakebase':
                    return new CakebaseRepository();
                default:
                    return new CakebaseRepository();
            }
        } catch (e) {
            return new CakebaseRepository();
        }
    }
}