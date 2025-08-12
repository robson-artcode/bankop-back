import {
    Controller,
    UseGuards,
    Get,
    Post,
    Put,
    Body,
    Request,
    HttpException,
    HttpStatus,
    Delete
} from '@nestjs/common';
import { UserService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

/**
 * Controller responsável pelas operações relacionadas ao perfil do usuário.
 *
 * Todas as rotas deste controller requerem autenticação JWT válida.
 *
 * @route /users
 */
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
    constructor(private readonly userService: UserService) { }

    /**
     * Obtém o perfil do usuário autenticado.
     *
     * @route GET /users/profile
     * @returns Objeto contendo o perfil do usuário
     * @throws HttpException 500 - Falha interna ao buscar perfil
     */
    @Get('/profile')
    async getProfile(@Request() req) {
        try {
            const profile = await this.userService.getProfile(req.user.userId);
            return { profile };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(
                'Falha ao buscar perfil. Por favor, tente novamente mais tarde.',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Cria um perfil para o usuário autenticado.
     *
     * @route POST /users/profile
     * @param profile Perfil a ser criado (CONSERVATIVE, MODERATE, SUCCESS)
     * @returns Objeto contendo o perfil criado e mensagem de sucesso
     * @throws HttpException 500 - Falha interna ao criar perfil
     */
    @Post('/profile')
    async createProfile(
        @Request() req,
        @Body('profile') profile: string
    ) {
        try {
            const createdProfile = await this.userService.createProfile(req.user.userId, profile);
            return { profile: createdProfile, message: 'Perfil criado com sucesso.' };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(
                'Falha ao criar perfil. Por favor, tente novamente mais tarde.',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Atualiza o perfil do usuário autenticado.
     *
     * @route PUT /users/profile
     * @param profile Novo perfil (CONSERVATIVE, MODERATE, SUCCESS)
     * @returns Objeto contendo o perfil atualizado e mensagem de sucesso
     * @throws HttpException 500 - Falha interna ao atualizar perfil
     */
    @Put('/profile')
    async updateProfile(
        @Request() req,
        @Body('profile') profile: string
    ) {
        try {
            const updatedProfile = await this.userService.updateProfile(req.user.userId, profile);
            return { profile: updatedProfile, message: 'Perfil atualizado com sucesso.' };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(
                'Falha ao atualizar perfil. Por favor, tente novamente mais tarde.',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Remove o perfil do usuário autenticado.
     *
     * @route DELETE /users/profile
     * @returns Mensagem de sucesso da exclusão
     * @throws HttpException 500 - Falha interna ao excluir perfil
     */
    @Delete('/profile')
    async deleteProfile(@Request() req) {
        try {
            await this.userService.deleteProfile(req.user.userId);
            return { message: 'Perfil removido com sucesso.' };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(
                'Falha ao excluir perfil. Por favor, tente novamente mais tarde.',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
