import { IRestaurantesRepository } from '../../domain/repositories/restaurantes-repository.interface';

export class DeletarRestauranteUseCase {
  constructor(private readonly repository: IRestaurantesRepository) {}

  async execute(id: string): Promise<void> {
    const restaurante = await this.repository.findById(id);
    if (!restaurante) {
      throw new Error('Restaurante não encontrado');
    }
    await this.repository.softDelete(id);
  }
}
