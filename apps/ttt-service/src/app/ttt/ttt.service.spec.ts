import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TTTService } from './ttt.service';
import { Room } from './room.entity';
import { TicTacToe } from './ttt.entity';
import { BadRequestException } from '@nestjs/common';

class RoomRepo extends Repository<Room> {}
class TTTRepo extends Repository<TicTacToe> {}

describe('TttService', () => {
  let service: TTTService;
  let roomRepo: RoomRepo;
  let tttRepo: TTTRepo;

  const newGame: TicTacToe = new TicTacToe();
  newGame.board = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];
  const newRoom: Room = new Room();
  newRoom.id = 1;
  newRoom.currentGame = newGame;

  beforeAll(async () => {
    const roomRepoToken = getRepositoryToken(Room);
    const TTTRepoToken = getRepositoryToken(TicTacToe);

    const module = await Test.createTestingModule({
      providers: [
        {
          provide: roomRepoToken,
          useClass: RoomRepo,
        },
        {
          provide: TTTRepoToken,
          useClass: TTTRepo,
        },
        TTTService,
      ],
    }).compile();

    service = module.get<TTTService>(TTTService);
    roomRepo = module.get<RoomRepo>(roomRepoToken);
    tttRepo = module.get<TTTRepo>(TTTRepoToken);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRoom', () => {
    it('should return a room', () => {
      jest
        .spyOn(roomRepo, 'findOneBy')
        .mockResolvedValueOnce(Promise.resolve(null));
      jest
        .spyOn(tttRepo, 'save')
        .mockImplementation((game: TicTacToe) => Promise.resolve(game));
      jest
        .spyOn(roomRepo, 'save')
        .mockImplementation((x: Room) => Promise.resolve(newRoom));

      // jest
      //   .spyOn(service, 'joinRoom')
      //   .mockResolvedValueOnce(Promise.resolve(newRoom));

      return service.createRoom(1).then((room) => expect(room).toBe(newRoom));
    });

    it('should throw an exception', () => {
      jest
        .spyOn(roomRepo, 'findOneBy')
        .mockResolvedValueOnce(Promise.resolve(newRoom));

      return service
        .createRoom(1234)
        .then(() => expect(true).toBe(false))
        .catch((err) => {
          expect(err).toBeInstanceOf(BadRequestException);
        });
    });
  });

  describe('joinRoom', () => {
    it('should return a room with p1 modified', () => {
      jest.spyOn(service, 'checkInRoom').mockResolvedValueOnce(false);
      jest
        .spyOn(roomRepo, 'findOneBy')
        .mockResolvedValueOnce(Promise.resolve(newRoom));
      jest
        .spyOn(roomRepo, 'save')
        .mockResolvedValueOnce(Promise.resolve(newRoom));

      const x: Room = { ...newRoom };
      x.p1 = 1;
      x.id = 1;

      return service.joinRoom(1, 1).then((room) => {
        expect(room).toEqual(newRoom);
      });
    });

    it('should return a room with p2 modified', () => {
      const before: Room = { ...newRoom };
      before.p1 = 1;
      before.id = 1;
      const after: Room = { ...before };
      after.p1 = 1;
      after.p2 = 2;
      after.id = 1;
      
      jest.spyOn(service, 'checkInRoom').mockResolvedValueOnce(false);
      jest
        .spyOn(roomRepo, 'findOneBy')
        .mockResolvedValueOnce(Promise.resolve(before));
      jest
        .spyOn(roomRepo, 'save')
        .mockImplementation((x) => Promise.resolve(x) as any);

      return service.joinRoom(2, 1).then((room) => {
        expect(room).toEqual(after);
      });
    });

    it('should return a room without modifications', () => {
      const before: Room = { ...newRoom };
      before.p1 = 1;
      before.p2 = 2;
      before.id = 1;
      
      jest.spyOn(service, 'checkInRoom').mockResolvedValueOnce(false);
      jest
        .spyOn(roomRepo, 'findOneBy')
        .mockResolvedValueOnce(Promise.resolve(before));
      jest
        .spyOn(roomRepo, 'save')
        .mockImplementation((x) => Promise.resolve(x) as any);

      return service.joinRoom(3, 1).then((room) => {
        expect(room).toEqual(before);
      });
    });

    it('should throw an exception as user is in a room', () => {
      jest.spyOn(service, 'checkInRoom').mockResolvedValueOnce(true);

      return service
        .joinRoom(1, 1)
        .then(() => expect(true).toBe(false))
        .catch((err) => {
          expect(err).toBeInstanceOf(BadRequestException);
        });
    });

    it('should throw an exception as room does not exist', () => {
      jest.spyOn(service, 'checkInRoom').mockResolvedValueOnce(false);
      jest
        .spyOn(roomRepo, 'findOneBy')
        .mockResolvedValueOnce(Promise.resolve(null));

      return service
        .joinRoom(1, 2)
        .then(() => expect(true).toBe(false))
        .catch((err) => {
          expect(err).toBeInstanceOf(BadRequestException);
        });
    });
  });

  describe('MakeMove', () => {
    it('should return a game that had x on index 1', () => {
      const x: Room = { ...newRoom };
      x.p1 = 1;
      x.id = 1;
      x.currentGame.xPlayer = 1;
      x.currentGame.oPlayer = 2;
      x.currentGame.board = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];

      jest.spyOn(service, 'findGame').mockResolvedValueOnce(x.currentGame);
      const expected: Room = { ...x };
      expected.currentGame = new TicTacToe();
      expected.currentGame.board = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];
      expected.currentGame.board[1] = 'x';
      expected.currentGame.xPlayer = 1;
      expected.currentGame.oPlayer = 2;
      expected.currentGame.xIsPlaying = false;
      expected.currentGame.wonBy = null; 
      jest
        .spyOn(tttRepo, 'save')
        .mockImplementation((x) => Promise.resolve(x) as any);

      return service
        .MakeMove(1, 1, 1)
        .then((game) => expect(game).toEqual(expected.currentGame));
    });

  //   it('should return a game that has o on index 1', () => {
  //     const x: Room = { ...newRoom };
  //     x.p1 = 1;
  //     x.p2 = 2;
  //     x.currentGame.xIsPlaying = false;
  //     x.id = 1;

  //     jest.spyOn(service, 'findGame').mockResolvedValueOnce(x.currentGame);
  //     const expected: Room = { ...x };
  //     expected.currentGame.board[1] = 'o';
  //     expected.currentGame.xIsPlaying = true;
  //     jest
  //       .spyOn(tttRepo, 'save')
  //       .mockResolvedValueOnce(Promise.resolve(expected.currentGame));

  //     return service
  //       .MakeMove(1, 1, 1)
  //       .then((game) => expect(game).toEqual(expected.currentGame));
  //   });

    it('should return a game unchanged as a winner exists', () => {
      const x: Room = { ...newRoom };
      x.p1 = 1;
      x.p2 = 2;
      x.currentGame.winner = 'x';
      x.id = 1;

      jest.spyOn(service, 'findGame').mockResolvedValueOnce(x.currentGame);
      const expected: Room = { ...x };
      expected.currentGame.board[1] = 'o';
      expected.currentGame.xIsPlaying = true;
      jest
        .spyOn(tttRepo, 'save')
        .mockImplementation((x) => Promise.resolve(x) as any);

      return service
        .MakeMove(1, 1, 1)
        .then((game) => expect(game).toEqual(expected.currentGame));
    });

    it('should return a game unchanged as index is occupied', () => {
      const x: Room = { ...newRoom };
      x.p1 = 1;
      x.p2 = 2;
      x.currentGame.board[1] = 'x';
      x.currentGame.winner = null;
      x.currentGame.xIsPlaying = true;
      x.id = 1;

      jest.spyOn(service, 'findGame').mockResolvedValueOnce(x.currentGame);
      jest
        .spyOn(tttRepo, 'save')
        .mockImplementation((x) => Promise.resolve(x) as any);

      return service
        .MakeMove(1, 1, 1)
        .then((game) => expect(game).toEqual(x.currentGame));
    });

    // it('should return a game with two moves', () => {
    //   const x: Room = { ...newRoom };
    //   x.p1 = 1;
    //   x.p2 = -1;
    //   x.currentGame.xIsPlaying = true;
    //   x.id = 1;

    //   jest.spyOn(service, 'findGame').mockResolvedValueOnce(x.currentGame);
    //   const expected: Room = { ...x };
    //   expected.currentGame.board[1] = 'x';
    //   expected.currentGame.board[0] = 'o';
    //   expected.currentGame.xIsPlaying = false;
    //   jest.spyOn(global.Math, 'random').mockReturnValue(0);
    //   jest
    //     .spyOn(tttRepo, 'save')
    //     .mockImplementation((x) => Promise.resolve(x) as any);

    //   return service
    //     .MakeMove(1, 1, 1)
    //     .then((game) => expect(game).toEqual(expected.currentGame));
    // });
  });

  describe('onDisconnect', () => {
    it('should return a game and disconnect p1', () => {
      const x: Room = { ...newRoom };
      x.p1 = 1;
      x.p2 = 2;
      x.id = 1;
      jest.spyOn(roomRepo, 'findOneBy').mockResolvedValueOnce(x);
      const expected: Room = { ...x };
      expected.currentGame.winner = 'o';
      expected.p1 = null;
      jest
        .spyOn(tttRepo, 'save')
        .mockResolvedValueOnce(Promise.resolve(expected.currentGame));
      jest
        .spyOn(roomRepo, 'save')
        .mockImplementation((x) => Promise.resolve(x) as any);

      return service
        .onDisconnect(1)
        .then((room) => expect(room).toEqual(expected));
    });

    it('should return a game and disconnect p2', () => {
      const x: Room = { ...newRoom };
      x.p1 = 1;
      x.p2 = 2;
      x.id = 1;
      jest
        .spyOn(roomRepo, 'findOneBy')
        .mockResolvedValueOnce(Promise.resolve(null));
      jest.spyOn(roomRepo, 'findOneBy').mockResolvedValueOnce(x);
      const expected: Room = { ...x };
      expected.currentGame.winner = 'x';
      expected.p2 = null;
      jest
        .spyOn(tttRepo, 'save')
        .mockResolvedValueOnce(Promise.resolve(expected.currentGame));
      jest
        .spyOn(roomRepo, 'save')
        .mockImplementation((x) => Promise.resolve(x) as any);

      return service
        .onDisconnect(2)
        .then((room) => expect(room).toEqual(expected));
    });
  });

  describe('CheckWin', () => {
    it('wonby row', () => {
      const game = { ...newGame };
      game.board = ['x', 'x', 'x', ' ', ' ', ' ', ' ', ' ', ' '];
      service.CheckWin(game as TicTacToe);

      expect(game.wonBy).toEqual([0, 1, 2]);
    });

    it('wonby col', () => {
      const game = { ...newGame };
      game.board = [' ', 'x', ' ', ' ', 'x', ' ', ' ', 'x', ' '];
      service.CheckWin(game as TicTacToe);

      expect(game.wonBy).toEqual([1, 4, 7]);
    });

    it('wonby diag \\', () => {
      const game = { ...newGame };
      game.board = ['x', ' ', ' ', ' ', 'x', ' ', ' ', ' ', 'x'];
      service.CheckWin(game as TicTacToe);

      expect(game.wonBy).toEqual([0, 4, 8]);
    });

    it('wonby diag /', () => {
      const game = { ...newGame };
      game.board = [' ', ' ', 'x', ' ', 'x', ' ', 'x', ' ', ' '];
      service.CheckWin(game as TicTacToe);

      expect(game.wonBy).toEqual([2, 4, 6]);
    });

    it('wonby none', () => {
      const game = { ...newGame };
      game.board = [' ', 'x', ' ', ' ', 'x', ' ', 'x', ' ', ' '];
      service.CheckWin(game as TicTacToe);

      expect(game.wonBy).toEqual(null);
    });
  });

  
  describe('makeRoomAI', () => {
    it('it should return a room', () => {
      const before: Room = { ...newRoom };
      before.p1 = 1;
      before.id = 1;
      jest
        .spyOn(service, 'createRoom')
        .mockResolvedValueOnce(Promise.resolve(newRoom));
      jest
        .spyOn(tttRepo, 'save')
        .mockImplementation((x) => Promise.resolve(x) as any);
      jest
        .spyOn(roomRepo, 'save')
        .mockImplementation((x) => Promise.resolve(x) as any);
      const after: Room = { ...newRoom };
      after.p1 = 1;
      after.p2 = -1;
      after.id = 1;

      return service.makeRoomAI(1).then((res) => expect(res).toEqual(after));
    });
  });

  describe('checkInRoom', () => {
    it('should not be in a room', () => {
      jest
        .spyOn(roomRepo, 'findOneBy')
        .mockResolvedValueOnce(Promise.resolve(null));

      return service.checkInRoom(1).then((res) => expect(res).toBe(false));
    });

    it('should be in a room', () => {
      jest
        .spyOn(roomRepo, 'findOneBy')
        .mockResolvedValueOnce(Promise.resolve(newRoom));

      return service.checkInRoom(1).then((res) => expect(res).toBe(true));
    });
  });

  describe('findGame', () => {
    it('should return false', () => {
      jest
        .spyOn(roomRepo, 'findOneBy')
        .mockResolvedValueOnce(Promise.resolve(newRoom));

      return service.findGame(1).then((res) => expect(res).toBe(newGame));
    });
  });

  describe('ResetBoard', () => {
    it('should clear the board', async () => {
      const game = { ...newGame };
      game.board = [' ', 'x', ' ', ' ', 'x', ' ', ' ', 'x', ' '];
      game.xIsPlaying = false;
      game.winner = 'x';
      jest
        .spyOn(service, 'findGame')
        .mockResolvedValueOnce(Promise.resolve(game as TicTacToe));
      jest
        .spyOn(tttRepo, 'save')
        .mockImplementation((x) => Promise.resolve(x) as any);

      await service.ResetBoard(1);

      expect(game.board).toEqual([' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ']);
      expect(game.xIsPlaying).toEqual(true);
      expect(game.winner).toEqual(null);
    });
  });
});
