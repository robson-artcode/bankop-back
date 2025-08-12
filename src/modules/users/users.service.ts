import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Obtém o perfil do usuário com base no userId.
     *
     * @param userId ID do usuário
     * @returns Perfil do usuário em minúsculas ou null se não encontrado
     */
    async getProfile(userId: string): Promise<string | null> {
        const userProfile = await this.prisma.usersProfile.findUnique({
            where: { userId }
        });

        return userProfile ? userProfile.profile.toLowerCase() : null;
    }

    /**
     * Atualiza o perfil do usuário.
     *
     * @param userId ID do usuário
     * @param profile Novo perfil (CONSERVATIVE, MODERATE, SUCCESS)
     * @returns Perfil atualizado
     * @throws HttpException 404 - Perfil não encontrado
     */
    async updateProfile(userId: string, profile: string): Promise<string> {
        const existingProfile = await this.prisma.usersProfile.findUnique({
            where: { userId }
        });

        if (!existingProfile) {
            throw new HttpException(
                'Perfil não encontrado para o usuário.',
                HttpStatus.NOT_FOUND
            );
        }

        const updatedProfile = await this.prisma.usersProfile.update({
            where: { userId },
            data: { profile }
        });

        return updatedProfile.profile;
    }

    /**
     * Cria um novo perfil para o usuário.
     *
     * @param userId ID do usuário
     * @param profile Perfil a ser criado (CONSERVATIVE, MODERATE, SUCCESS)
     * @returns Perfil criado
     * @throws HttpException 404 - Usuário não encontrado
     * @throws HttpException 409 - Perfil já existente
     */
    async createProfile(userId: string, profile: string): Promise<string> {
        const user = await this.prisma.users.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new HttpException(
                'Usuário não encontrado.',
                HttpStatus.NOT_FOUND
            );
        }

        const existingProfile = await this.prisma.usersProfile.findUnique({
            where: { userId }
        });

        if (existingProfile) {
            throw new HttpException(
                'Perfil já existe para este usuário. Utilize o método de atualização.',
                HttpStatus.CONFLICT
            );
        }

        const createdProfile = await this.prisma.usersProfile.create({
            data: {
                userId,
                profile
            }
        });

        return createdProfile.profile;
    }

    /**
     * Remove o perfil de um usuário.
     *
     * @param userId ID do usuário
     * @throws HttpException 404 - Perfil não encontrado
     */
    async deleteProfile(userId: string): Promise<void> {
        const existingProfile = await this.prisma.usersProfile.findUnique({
            where: { userId }
        });

        if (!existingProfile) {
            throw new HttpException(
                'Perfil não encontrado para o usuário.',
                HttpStatus.NOT_FOUND
            );
        }

        await this.prisma.usersProfile.delete({
            where: { userId }
        });
    }
}
