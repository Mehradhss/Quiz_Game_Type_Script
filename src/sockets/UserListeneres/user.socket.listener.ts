import createGame from "../../services/Game/game.creation.service";
import joinRoom from "../../services/Game/room.join.service";
import {io} from "../../server/server.config";
import asyncWrapper from "../../middleware/wrappers/async.wrapper";
import {getRedisClient} from "../../redis/RedisConfig/redis.config";
import {authSocketMiddleware} from "../../middleware/auth.middleware";
import {Socket} from "socket.io";
import socketWrapper from "../../middleware/wrappers/socket.wrapper";
import {getVerifiedUserService} from "../../services/Auth/getVerifiedUser.service";
import createRoom from "../../services/Game/room.creation.service";
import {dataSource} from "../../../database/DataSource";
import {Category} from "../../../database/entity/Category";
import {GameRoom} from "../../../database/entity/GameRoom";
import {renew} from "../../services/Redis/redis.renew.expire.date.service";
import {getJoinAbleGameRoom} from "../../services/Game/game.room.search.service";
import isUserJoined from "../../services/Game/room.is.user.joined.service";
import {Game} from "../../../database/entity/Game";
import {startGame} from "../../services/Game/game.start.service";
import {fetchQuestion} from "../../services/Game/game.fetch.question.service";
import {submitAnswer} from "../../services/Game/game.submit.answer.service";
import {leaveRoom} from "../../services/Game/room.leave.service";
import {leaveGame} from "../../services/Game/game.leave.service";
import {endGame} from "../../services/Game/game.end.service";
import {gameResource} from "../../resources/game.resource";
import {userResource} from "../../resources/user.resource";
import {gameRoomResource} from "../../resources/game.room.resource";
import {answerResource} from "../../resources/answer.resource";
import {jsonParser} from "../../helpers/json.parser";
import {gameQuestionResource} from "../../resources/game.question.resource";
import {answerCollectionResource} from "../../resources/answer.collection.resource";
import {categoryResource} from "../../resources/category.resource";
import * as i18n from "i18n";

const gameStatus = Object.freeze({
    PENDING: 'PENDING',
    STARTED: 'STARTED',
    FINALIZING: 'FINALIZING',
    FINISHED: 'FINISHED'
});

const v1UserRoute = io.of('/v1/user').use((socket, next) => {
    authSocketMiddleware(socket, next)
})


const userSocketListeners = asyncWrapper(async () => {
        v1UserRoute.adapter.on("create-room", (room) => {
            console.log(`[${new Date().toISOString()}]`, `room ${room} was created`);
        })

        v1UserRoute.on('connection', asyncWrapper(async (socket: Socket) => {
                const socketId = socket.id;
                console.log(`A user connected with ID: ${socketId}`);

                const verifiedUser = await getVerifiedUserService(socket?.handshake?.headers.authorization.split('|')[1])

                verifiedUser.gameRooms.forEach((gameRoom: GameRoom) => {
                    socket.join(gameRoom.uuid)

                    socket.emit(`joined.${gameRoom.uuid}`, {roomId: gameRoom.uuid})
                })

                const verifiedUserId = verifiedUser?.id

                const redisClient = getRedisClient()

                socketWrapper(socket, 'createGameRoom', async () => {
                    /** get empty game room no longer needed*/
                     // const availableEmptyRoom = await getEmptyGameRoom()
                     //
                     // if (availableEmptyRoom) {
                     // await joinRoom(socket, availableEmptyRoom.uuid, verifiedUserId)
                     //
                     // redisClient.set(`room.${availableEmptyRoom.uuid}`, availableEmptyRoom.uuid, "EX", 30 * 60)
                     //
                     // socket.emit('gameRoomCreated', {roomId: availableEmptyRoom.uuid})
                     //
                     // return
                     // }

                    const newRoom = await createRoom(verifiedUserId)

                    redisClient.set(`room.${newRoom.uuid}`, newRoom.uuid, "EX", 30 * 60)

                    socket.join(newRoom.uuid)

                    socket.emit('gameRoomCreated', {roomId: newRoom.uuid})

                }, "createGameRoomError")

                socketWrapper(socket, 'joinGameRoom', async (data) => {
                    data = jsonParser(data)

                    const roomId = data.roomId
                    if (!roomId) {
                        throw new Error(i18n.__('room_id_not_provided'));
                    }

                    const gameRoom = await dataSource.getRepository(GameRoom).findOne({
                        where: {
                            uuid: roomId
                        },
                        relations: ["users", "games"]
                    });

                    if (!gameRoom) {
                        throw new Error(i18n.__('room_not_found'))
                    }

                    if (gameRoom.users.length > 2) {
                        throw new Error(i18n.__('room_is_full'))
                    }

                    const isVerifiedUserJoined = await isUserJoined(gameRoom, verifiedUserId);

                    if (isVerifiedUserJoined) {
                        throw new Error(i18n.__('user_already_joined'))
                    }

                    const joinedGameRoom = await joinRoom(socket, roomId, verifiedUserId);

                    await renew(`room.${gameRoom.uuid}`, 'room')

                    v1UserRoute.to(roomId).emit('gameRoomJoined', {
                        data: {
                            room: gameRoomResource(joinedGameRoom),
                            user: userResource(verifiedUser)
                        }
                    });

                    if (gameRoom.users.length === 2) {
                        v1UserRoute.to(roomId).emit('gameRoomReadyToStart', {room: gameRoomResource(gameRoom)});
                    }

                    console.log('User joined game with room ID:', roomId);

                }, "gameRoomJoinError")

                socketWrapper(socket, 'searchForGameRoom', async () => {
                    const joinAbleGameRoom = await getJoinAbleGameRoom(verifiedUserId)

                    if (!joinAbleGameRoom) {
                        throw new Error(i18n.__('no_joinable_game_room_found.'))
                    }

                    await renew(`room.${joinAbleGameRoom.uuid}`, 'room')

                    socket.emit('searchForGameSuccess', {data: gameRoomResource(joinAbleGameRoom)});

                }, "searchForGameError")

                socketWrapper(socket, 'selectCategory', async (data) => {
                    data = jsonParser(data);

                    const roomId = data.roomId;

                    const gameRoom = await dataSource.getRepository(GameRoom).findOne({
                        where: {
                            uuid: roomId
                        },
                        relations: ["users"]
                    });

                    if (!roomId || !gameRoom) {
                        throw new Error(i18n.__('room_not_found'))
                    }

                    if (!await isUserJoined(gameRoom, verifiedUserId)) {
                        throw new Error(i18n.__('user_is_not_joined_in_the_given_room'))
                    }

                    const categoryId = data.categoryId;

                    const categoryRepository = await dataSource.getRepository(Category);
                    const category = await categoryRepository.findOneOrFail({
                        where: {
                            id: categoryId
                        }
                    })

                    await renew(`room.${roomId}`, 'room')

                    const categorySelectedKey = `${verifiedUserId}.category.${roomId}.selected`;

                    await redisClient.hset(categorySelectedKey, categoryId, categoryId)

                    v1UserRoute.to(roomId).emit("categorySelected", {
                        data: {
                            category: categoryResource(category),
                            user: userResource(verifiedUser)
                        }
                    });
                }, "selectCategoryError")

                socketWrapper(socket, 'createGame', async (data) => {
                    data = jsonParser(data);

                    const roomId = data.roomId;
                    if (!roomId) {
                        throw new Error(i18n.__('room_id_not_provided'));
                    }

                    const categoryId = data.categoryId;
                    if (!categoryId) {
                        throw new Error(i18n.__('category_not_provided'))
                    }

                    const socketRoom = v1UserRoute.adapter.rooms.get(roomId);

                    const gameRoom = await dataSource.getRepository(GameRoom).findOneOrFail({
                        where: {
                            uuid: roomId
                        },
                        relations: ["users", "users.games", "games"]
                    })

                    if (!socketRoom || !gameRoom) {
                        throw new Error(i18n.__('room_not_found'));
                    }

                    if (socketRoom.size < 2) {
                        throw new Error(i18n.__('a_user_disconnected'))
                    }

                    if (gameRoom.users.length < 2) {
                        throw new Error(i18n.__('not_enough_players'));
                    }

                    if (!await isUserJoined(gameRoom, verifiedUserId)) {
                        throw new Error(i18n.__('user_is_not_joined_in_the_given_room'));
                    }

                    socket.join(gameRoom.uuid)

                    await renew(`room.${roomId}`, 'room')

                    const difficultyMultiplier = parseInt(data.difficulty ?? "1")

                    const newGame = await createGame(gameRoom, gameStatus.PENDING, categoryId, difficultyMultiplier)

                    const newGameWithCategory = await dataSource.getRepository(Game).findOne({
                        where: {
                            id: newGame.id,
                        },
                        relations: ['category']
                    })

                    v1UserRoute.to(gameRoom.uuid).emit('gameCreated', {data: {game: gameResource(newGameWithCategory)}})
                }, "gameCreationError")

                socketWrapper(socket, 'readyToStart', async (data) => {
                    data = jsonParser(data);

                    const roomId = data.roomId
                    if (!roomId) {
                        throw new Error(i18n.__('room_id_not_provided'))
                    }

                    const gameId = data.gameId
                    if (!gameId) {
                        throw new Error(i18n.__('game_id_not_provided'))
                    }
                    const game = await dataSource.getRepository(Game).findOneOrFail({
                        where: {
                            id: gameId
                        },
                        relations: ["users"]
                    })

                    if (game.status === gameStatus.STARTED) {
                        throw new Error(i18n.__('game_already_started'))
                    }

                    if (game.users.length < 2) {
                        throw new Error(i18n.__('not_enough_players_to_ready_up'));
                    }

                    const playerReadyKey = `game.${gameId}.ready.players`;

                    const stringUserId = verifiedUserId.toString();

                    if (await redisClient.exists(playerReadyKey)) {
                        if (await redisClient.hexists(playerReadyKey, stringUserId)) {
                            throw new Error(i18n.__('player_already_readied_up'))
                        }
                    }

                    await redisClient.hset(playerReadyKey, stringUserId, stringUserId)

                    await renew(playerReadyKey, "game")

                    if (await redisClient.hlen(playerReadyKey) === game.users.length) {
                        v1UserRoute.to(roomId).emit('readyToStartGame', {data: {game: gameResource(game)}})
                    }

                    await renew(`room.${roomId}`, 'room')

                    v1UserRoute.to(roomId).emit('playerReady', {data: {user: userResource(verifiedUser)}})
                }, "readyToStartError")

                socketWrapper(socket, "unreadyToStart", async (data) => {
                    data = jsonParser(data);

                    const roomId = data.roomId
                    if (!roomId) {
                        throw new Error(i18n.__('room_id_not_provided'))
                    }

                    const gameId = data.gameId
                    if (!gameId) {
                        throw new Error(i18n.__('game_id_not_provided'))
                    }
                    const game = await dataSource.getRepository(Game).findOneOrFail({
                        where: {
                            id: gameId
                        },
                        relations: ["users"]
                    })

                    if (game.status === gameStatus.STARTED) {
                        throw new Error(i18n.__('game_already_started'))
                    }

                    if (game.users.length < 2) {
                        throw new Error(i18n.__('not_enough_players_to_ready_up'));
                    }

                    const playerReadyKey = `game.${gameId}.ready.players`;

                    const stringUserId = verifiedUserId.toString();

                    if (!await redisClient.exists(playerReadyKey) || !await redisClient.hexists(playerReadyKey, stringUserId)) {
                        throw new Error(i18n.__('player_has_not_readied_up_yet'))
                    }

                    await redisClient.hdel(playerReadyKey, stringUserId)

                    await renew(playerReadyKey, "game")

                    await renew(`room.${roomId}`, 'room')

                    v1UserRoute.to(roomId).emit('playerUnready', {data: {user: userResource(verifiedUser)}})

                }, "unreadyToStartError")

                socketWrapper(socket, 'userGameState', async (data) => {
                    data = jsonParser(data);

                    const gameId = data.gameId
                    if (!gameId) {
                        throw new Error(i18n.__('game_id_not_provided'))
                    }
                    const game = await dataSource.getRepository(Game).findOneOrFail({
                        where: {
                            id: gameId
                        },
                        relations: ["users"]
                    })

                    const playerReadyKey = `game.${gameId}.ready.players`;

                    let usersGameStates = [];

                    for (const user of game.users) {
                        let playerIsFinished = false;
                        let playerReadyState = false;
                        const stringUserId = user.id.toString();

                        const playerEndKey = `ended.${gameId}`
                        if (await redisClient.exists(playerEndKey)) {
                            if (await redisClient.hexists(playerEndKey, stringUserId)) {
                                playerIsFinished = true
                            }
                        }

                        if (await redisClient.hexists(playerReadyKey, stringUserId)) {
                            playerReadyState = true
                        }

                        usersGameStates.push({
                            user: userResource(user),
                            readyState: playerReadyState,
                            isFinished: playerIsFinished
                        })
                    }

                    socket.emit("userGameStateReady", {data: usersGameStates})

                }, "userGameStateError")

                socketWrapper(socket, 'startGame', async (data) => {
                    data = jsonParser(data);

                    const roomId = data.roomId
                    if (!roomId) {
                        throw new Error(i18n.__('room_id_not_provided'))
                    }
                    // const socketRoom = v1UserRoute.adapter.rooms.get(roomId);

                    const gameId = data.gameId;
                    if (!gameId) {
                        throw new Error(i18n.__('game_id_not_provided'))
                    }

                    // if (socketRoom.size < 2) {
                    //     throw new Error("a player disconnected!")
                    // }

                    const playerReadyKey = `game.${gameId}.ready.players`;
                    if (!await redisClient.exists(playerReadyKey) || await redisClient.hlen(playerReadyKey) < 2) {
                        throw new Error(i18n.__('players_must_ready_up'))
                    }

                    const game = await dataSource.getRepository(Game).findOneOrFail({
                        where: {
                            id: gameId
                        },
                        relations: ["users", "gameQuestions", "category", "session"]
                    });
                    if (game.status === gameStatus.STARTED) {
                        throw new Error(i18n.__('game_already_started'))
                    }

                    if (game.status === gameStatus.FINISHED) {
                        throw new Error(i18n.__('game_finished'))
                    }

                    if (game.users.length < 2) {
                        throw new Error(i18n.__('not_enough_players'));
                    }

                    await renew(playerReadyKey, "game")

                    await renew(`room.${roomId}`, 'room')

                    const startedGame = await startGame(game, gameStatus.STARTED)

                     const startedGameWithSession = await dataSource.getRepository(Game).findOneOrFail({
                        where: {
                            id: startedGame.game.id
                        },
                        relations: ["users", "gameQuestions", "category", "session"]
                    });

                    v1UserRoute.to(roomId).emit("gameStarted", {
                        data: {
                            game: gameResource(startedGameWithSession),
                            gameTime: startedGame.gameTime
                        }
                    })
                }, "gameStartError")

                socketWrapper(socket, 'fetchQuestion', async (data) => {
                    data = jsonParser(data);

                    const roomId = data.roomId
                    if (!roomId) {
                        throw new Error(i18n.__('room_id_not_provided'))
                    }
                    await renew(`room.${roomId}`, 'room')

                    const gameId = data.gameId;
                    if (!gameId) {
                        throw new Error(i18n.__('game_id_not_provided'))
                    }
                    const game = await dataSource.getRepository(Game).findOne({
                        where: {
                            id: gameId
                        },
                        relations: ["users", "gameQuestions", "category", "gameRoom"]
                    });

                    if (!game) {
                        throw new Error(i18n.__('game_not_found'));
                    }
                    if (game.status === gameStatus.FINISHED) {
                        throw new Error(i18n.__('game_finished'));
                    }

                    if (game.users.length < 2) {
                        throw new Error(i18n.__('not_enough_players_to_continue_the_game'));
                    }

                    if (game.status != gameStatus.STARTED) {
                        if (game.status === gameStatus.FINISHED) {
                            throw new Error(i18n.__('game_finished'))
                        }

                        throw new Error(i18n.__('game_has_not_started_yet'));
                    }

                    const fetchedGameQuestion = await fetchQuestion(game, verifiedUserId)

                    if (!fetchedGameQuestion) {
                        throw new Error(i18n.__('all_questions_are_answered'))
                    }

                    socket.emit("questionFetched", {
                        data: {
                            gameQuestion: gameQuestionResource(fetchedGameQuestion.question),
                            answers: answerCollectionResource(fetchedGameQuestion.answers),
                            remainingQuestionsCount: fetchedGameQuestion.remainingQuestionsCount,
                        }
                    })
                }, "fetchQuestionError")

                socketWrapper(socket, "submitAnswer", async (data) => {
                    data = jsonParser(data);

                    const roomId = data.roomId
                    if (!roomId) {
                        throw new Error(i18n.__('room_id_not_provided'))
                    }
                    await renew(`room.${roomId}`, 'room')

                    const gameId = data.gameId;
                    if (!gameId) {
                        throw new Error(i18n.__('game_id_not_provided'))
                    }

                    const game = await dataSource.getRepository(Game).findOne({
                        where: {
                            id: gameId
                        }
                    })
                    if (!game) {
                        throw new Error(i18n.__('game_not_found'))
                    }
                    if (game.status === gameStatus.FINISHED) {
                        throw new Error(i18n.__('game_finished'))
                    }

                    const answer = data.answer;

                    await submitAnswer(verifiedUser, answer)

                    socket.emit("answerSubmitted", {data: {answer: answerResource(answer)}})

                }, "submitAnswerError")

                socketWrapper(socket, "leaveGameRoom", async (data) => {
                    data = jsonParser(data);

                    const roomId = data.roomId
                    if (!roomId) {
                        throw new Error(i18n.__('room_id_not_provided'))
                    }
                    const gameRoom = await dataSource.getRepository(GameRoom).findOneOrFail({
                        where: {
                            uuid: roomId
                        },
                        relations: ["users", "games", "games.users", "games.gameRoom"]
                    });
                    await renew(`room.${roomId}`, 'room')

                    const isVerifiedUserJoined = await isUserJoined(gameRoom, verifiedUserId);

                    if (!isVerifiedUserJoined) {
                        throw new Error(i18n.__('user_is_not_joined_in_the_given_room'))
                    }

                    const leavedGameRoom = await leaveRoom(gameRoom, verifiedUserId, gameStatus.FINISHED)

                    v1UserRoute.to(roomId).emit("leavedGameRoom", {data: {room: gameRoomResource(leavedGameRoom)}})
                }, "leaveGameRoomError");

                socketWrapper(socket, "leaveGame", async (data) => {
                    data = jsonParser(data);

                    const roomId = data.roomId
                    if (!roomId) {
                        throw new Error(i18n.__('room_id_not_provided'))
                    }
                    await renew(`room.${roomId}`, 'room')

                    const gameId = data.gameId;
                    if (!gameId) {
                        throw new Error(i18n.__('game_id_not_provided'))
                    }

                    const game = await dataSource.getRepository(Game).findOneOrFail({
                        where: {
                            id: gameId
                        },
                        relations: ["users", "gameRoom"]
                    })

                    if (!game.users.some(user => user.id === verifiedUserId)) {
                        throw new Error(i18n.__('user_is_not_in_the_game'))
                    }

                    if (game.status != gameStatus.STARTED) {
                        throw new Error(i18n.__('cannot_leave_a_game_that_has_not_been_started_yet'))
                    }

                    await leaveGame(game, verifiedUserId);

                    socket.emit("leavedGame", {data: {game: gameResource(game)}})

                }, "leaveGameError")

                socketWrapper(socket, "playerEndedGame", async (data) => {
                    data = jsonParser(data);

                    const gameId = data.gameId;
                    if (!gameId) {
                        throw new Error(i18n.__('game_id_not_provided'))
                    }

                    const game = await dataSource.getRepository(Game).findOneOrFail({
                        where: {
                            id: gameId
                        },
                        relations: ["gameRoom", "users", "winner"]
                    })

                    await renew(`room.${game.gameRoom.uuid}`, 'room')

                    if (!game.users.some(user => user.id === verifiedUserId)) {
                        throw new Error(i18n.__('user_is_not_in_the_game'));
                    }

                    if (game.status === gameStatus.FINISHED) {
                        throw new Error(i18n.__('game_finished'))
                    }

                    const playerEndKey = `ended.${gameId}`

                    const stringUserId = verifiedUserId.toString();

                    if (await redisClient.exists(playerEndKey)) {
                        if (await redisClient.hexists(playerEndKey, stringUserId)) {
                            throw new Error(i18n.__('the_game_for_this_player_has_already_ended'))
                        }
                    }

                    await redisClient.hset(playerEndKey, stringUserId, stringUserId)

                    socket.emit("playerGameEnded", {
                        data: {
                            message: "player game finished",
                            gameRoom: gameRoomResource(game.gameRoom),
                            user: userResource(verifiedUser)
                        }
                    })

                    if (await redisClient.hlen(playerEndKey) === game.users.length) {
                        await endGame(game, gameStatus.FINISHED)

                        return
                    }

                    v1UserRoute.to(game.gameRoom.uuid).emit("playerGameEndedNotify", {
                        data: {
                            message: "player game finished",
                            gameRoom: gameRoomResource(game.gameRoom),
                            user: userResource(verifiedUser)
                        }
                    })
                }, "playerEndGameError")

                socketWrapper(socket, "endGame", async (data) => {
                    data = jsonParser(data);

                    const gameId = data.gameId;
                    if (!gameId) {
                        throw new Error(i18n.__('game_id_not_provided'))
                    }

                    const game = await dataSource.getRepository(Game).findOneOrFail({
                        where: {
                            id: gameId
                        },
                        relations: ["gameRoom", "users", "winner"]
                    })

                    await renew(`room.${game.gameRoom.uuid}`, 'room')

                    if (!game.users.some(user => user.id === verifiedUserId)) {
                        throw new Error(i18n.__('user_is_not_in_the_game'))
                    }

                    if (game.status === gameStatus.FINISHED) {
                        throw new Error(i18n.__('game_finished'))
                    }

                    await endGame(game, gameStatus.FINISHED);

                    v1UserRoute.to(game.gameRoom.uuid).emit("gameEnded", {
                        data: {
                            game: gameResource(game),
                        }
                    })

                }, "endGameError")

                socketWrapper(socket, 'disconnect', async () => {
                    if (redisClient.exists(socketId)) {
                        redisClient.del(socketId)
                    }
                });
            })
        )
    }
)

export {
    userSocketListeners,
    v1UserRoute
}