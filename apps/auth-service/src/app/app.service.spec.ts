import { Test } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import fsPromises from 'node:fs/promises';

import { AppService } from './app.service';
import { Account } from './account.entity';
import { Profile } from './profile.entity';

class AccountRepo extends Repository<Account> {}

class ProfileRepo extends Repository<Profile> {}

describe('AppService', () => {
  let service: AppService;
  let jwtservice: JwtService;
  let accountRepo: AccountRepo;
  let profileRepo: ProfileRepo;

  const acc1: Account = new Account();
  acc1.uid = 0;
  acc1.username = 'pupupupu';
  acc1.password = 'acc1';
  acc1.profile = new Profile();
  acc1.profile.avatar = '1';

  const acc2: Account = new Account();
  acc2.uid = 1;
  acc2.username = 'seb';
  acc2.password = 'acc2';
  acc2.profile = new Profile();
  acc2.profile.avatar = '2';

  const acc3: Account = new Account();
  acc3.uid = 2;
  acc3.username = 'steph';
  acc3.password = 'acc3';
  acc3.profile = new Profile();
  acc3.profile.avatar = '3';

  const acc4: Account = new Account();
  acc4.uid = 3;
  acc4.username = 'rise';
  acc4.password = 'acc4';
  acc4.profile = new Profile();
  acc4.profile.avatar = '4';

  const acc5: Account = new Account();
  acc5.uid = 4;
  acc5.username = 'zef';
  acc5.password = 'acc5';
  acc5.profile = new Profile();
  acc5.profile.avatar = '5';

  const acc6: Account = new Account();
  acc6.uid = 5;
  acc6.username = 'duck';
  acc6.password = 'acc6';
  acc6.profile = new Profile();
  acc6.profile.avatar = '6';

  beforeAll(async () => {
    const accountRepoToken = getRepositoryToken(Account);
    const profileRepoToken = getRepositoryToken(Profile);

    const app = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'mysecret',
          signOptions: { expiresIn: '600s' },
        }),
      ],
      providers: [
        {
          provide: accountRepoToken,
          useClass: AccountRepo,
        },
        {
          provide: profileRepoToken,
          useClass: ProfileRepo,
        },
        AppService,
      ],
    }).compile();

    service = app.get<AppService>(AppService);
    jwtservice = app.get<JwtService>(JwtService);
    accountRepo = app.get<AccountRepo>(accountRepoToken);
    profileRepo = app.get<ProfileRepo>(profileRepoToken);
  });

  describe('getData', () => {
    it('should return "Hello API"', () => {
      expect(service.getData()).toEqual({ message: 'Hello API' });
    });
  });

  describe('signout', () => {
    it('should do nothing?', () => {
      service.signout();
      expect(true).toBe(true);
    });
  });

  describe('verify', () => {
    it('should return an account', () => {
      jest.spyOn(jwtservice, 'verify').mockReturnValueOnce({
        verfied: true
      });
      jest.spyOn(accountRepo, "findOneBy").mockReturnValueOnce(Promise.resolve(acc2));
      return service.verify("abc").then((res) => 
      expect(res).toEqual(acc2));
    });

    it('should not return an account', () => {
      jest.spyOn(jwtservice, 'verify').mockReturnValueOnce({
        verfied: true
      });
      jest.spyOn(accountRepo, "findOneBy").mockReturnValueOnce(Promise.resolve(null));
      return service.verify("abc").then((res) => 
      expect(res).toBe(null));
    });
  });


  describe('signup', () => {
    it('Should gives tokens', () => {
      // Cannot find the user
      jest
        .spyOn(accountRepo, 'findOne')
        .mockResolvedValueOnce(Promise.resolve(null));

      jest
        .spyOn(accountRepo, 'save')
        .mockResolvedValueOnce(Promise.resolve(acc1));
      jest
        .spyOn(profileRepo, 'save')
        .mockResolvedValueOnce(Promise.resolve(acc1.profile));

      return service
        .signup({
          username: acc1.username,
          password: acc1.password,
          avatar: acc1.profile.avatar,
        })
        .then((res) => {
          expect(res).toHaveProperty('access_token');
          // Not this sprint
          // expect(res).toHaveProperty('refresh_token');
        });
    });

    it('Should not success', () => {
      // Mock already exists
      jest
        .spyOn(accountRepo, 'findOne')
        .mockResolvedValueOnce(Promise.resolve(acc2));

      return service
        .signup({
          username: acc2.username,
          password: acc2.password,
          avatar: acc2.profile.avatar,
        })
        .then(() => {
          expect(true).toBe(false);
        })
        .catch((err) => {
          expect(err).toBeDefined();
        });
    });
  });

  describe('signin', () => {
    it('Should gives tokens', () => {
      jest
        .spyOn(accountRepo, 'findOne')
        .mockResolvedValueOnce(Promise.resolve(acc3));

      return service.signin(acc3.username, acc3.password).then((res) => {
        expect(res).toHaveProperty('access_token');
        // Not this sprint
        // expect(res).toHaveProperty('refresh_token');
      });
    });
  });

  describe('getRandomAvatar', () => {
    it('Should return a string', () => {
      jest
        .spyOn(service, 'getAvatars')
        .mockResolvedValueOnce(Promise.resolve(['1','2','3','4','5']));

      return service.getRandomAvatar().then((res) => {
        expect(res).toStrictEqual('4');
      });
    });
  });

});
