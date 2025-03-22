/**
 *example-api\users.js
 * @api {get} /api/users Listar Usuários
 * @apiName GetUsers
 * @apiGroup Usuários
 * @apiVersion 1.0.0
 * @apiDescription Retorna uma lista paginada de usuários.
 *
 * @apiParam {Number} [page=1] Número da página para paginação.
 * @apiParam {Number} [limit=10] Número de itens por página.
 *
 * @apiSuccess {Object[]} users Lista de usuários.
 * @apiSuccess {Number} users.id ID único do usuário.
 * @apiSuccess {String} users.name Nome completo do usuário.
 * @apiSuccess {String} users.email Endereço de e-mail do usuário.
 * @apiSuccess {Date} users.createdAt Data de criação do usuário.
 * @apiSuccess {Number} totalPages Número total de páginas.
 * @apiSuccess {Number} currentPage Número da página atual.
 *
 * @apiSuccessExample {json} Sucesso:
 *     HTTP/1.1 200 OK
 *     {
 *       "users": [
 *         {
 *           "id": 1,
 *           "name": "João Silva",
 *           "email": "joao@example.com",
 *           "createdAt": "2023-03-20T10:30:00Z"
 *         },
 *         {
 *           "id": 2,
 *           "name": "Maria Santos",
 *           "email": "maria@example.com",
 *           "createdAt": "2023-03-21T14:15:00Z"
 *         }
 *       ],
 *       "totalPages": 5,
 *       "currentPage": 1
 *     }
 *
 * @apiError (400) BadRequest Os parâmetros fornecidos são inválidos.
 * @apiError (401) Unauthorized Autenticação é necessária.
 * @apiError (403) Forbidden Usuário não tem permissão para acessar este recurso.
 * @apiError (500) InternalServerError Erro interno do servidor.
 *
 * @apiErrorExample {json} Erro 400:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Parâmetros inválidos",
 *       "details": "O valor de 'limit' deve ser um número entre 1 e 100."
 *     }
 */
/**
 * @api {get} /api/users/:id Obter Usuário
 * @apiName GetUser
 * @apiGroup Usuários
 * @apiVersion 1.0.0
 * @apiDescription Retorna os detalhes de um usuário específico.
 *
 * @apiParam {Number} id ID único do usuário.
 *
 * @apiSuccess {Number} id ID único do usuário.
 * @apiSuccess {String} name Nome completo do usuário.
 * @apiSuccess {String} email Endereço de e-mail do usuário.
 * @apiSuccess {Date} createdAt Data de criação do usuário.
 * @apiSuccess {Object} address Endereço do usuário.
 * @apiSuccess {String} address.street Rua.
 * @apiSuccess {String} address.city Cidade.
 * @apiSuccess {String} address.state Estado.
 * @apiSuccess {String} address.zipCode Código postal.
 *
 * @apiSuccessExample {json} Sucesso:
 *     HTTP/1.1 200 OK
 *     {
 *       "id": 1,
 *       "name": "João Silva",
 *       "email": "joao@example.com",
 *       "createdAt": "2023-03-20T10:30:00Z",
 *       "address": {
 *         "street": "Rua das Flores, 123",
 *         "city": "São Paulo",
 *         "state": "SP",
 *         "zipCode": "01234-567"
 *       }
 *     }
 *
 * @apiError (404) NotFound Usuário não encontrado.
 * @apiError (500) InternalServerError Erro interno do servidor.
 *
 * @apiErrorExample {json} Erro 404:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "Usuário não encontrado",
 *       "details": "Não foi possível encontrar um usuário com o ID fornecido."
 *     }
 */
