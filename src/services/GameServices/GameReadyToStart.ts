import {dataSource} from "../../../database/DataSource";
import asyncWrapper from "../../middleware/wrappers/asyncWrapper";
import {Game} from "../../../database/entity/Game";
import {User} from "../../../database/entity/User";


export const playerReadyToStart = asyncWrapper(async function (playerId: number, gameId: number) {
    const gameRepository = await dataSource.getRepository(Game);
    const userRepository = await dataSource.getRepository(User);

    const gameExists = await userRepository.createQueryBuilder('users')
        .leftJoinAndSelect('users.games', 'games')
        .where('users.id = :playerId', {playerId: playerId})
        .andWhere('games.id = :gameId', {gameId: gameId})
        .getOne();

    if (gameExists) {
        return;
    }

    const game = await gameRepository.findOne({where: {id: gameId}});

    const user = await userRepository.findOne({where: {id: playerId}, relations: ['games']});

    await user?.games.push(game);

    await userRepository.save(user);
});