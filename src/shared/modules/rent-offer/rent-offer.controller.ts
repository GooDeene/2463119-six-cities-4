import {
  BaseController,
  DocumentExistsMiddleware,
  HttpMethod,
  ValidateDtoMiddleware,
  ValidateObjectIdMiddleware,
} from '../../libs/rest/index.js';
import { CommentService } from '../comment/comment-service.interface.js';
import { CreateRentOfferRequest } from './create-rent-offer-request.js';
import { RentOfferResponseRdo } from './rdo/rent-offer-response.rdo.js';
import { UpdateRentOfferRequest } from './update-rent-offer-request.js';
import { ParamRentOfferId } from './types/param-rent-offer-id.type.js';
import { RentOfferService } from './rent-offer-service.interface.js';
import { CreateRentOfferDto } from './dto/create-rent-offer.dto.js';
import { PatchRentOfferDto } from './dto/patch-rent-offer.dto.js';
import { RequestQuery } from './types/request-query.type.js';
import { CommentRdo } from '../comment/rdo/comment.rdo.js';
import { ParamsCity } from './types/param-city.type.js';
import { RentOfferRdo } from './rdo/rent-offer.rdo.js';
import { Logger } from '../../libs/logger/index.js';
import { Component } from '../../types/index.js';
import { fillDTO } from '../../helpers/index.js';
import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';

@injectable()
export class RentOfferController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.RentOfferService)
    private readonly rentOfferService: RentOfferService,
    @inject(Component.CommentService)
    private readonly commentService: CommentService
  ) {
    super(logger);
    this.logger.info('Register routes for RentOfferController…');

    this.addRoute({
      path: '',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [new ValidateDtoMiddleware(CreateRentOfferDto)],
    });
    this.addRoute({ path: '/', method: HttpMethod.Get, handler: this.index });
    this.addRoute({
      path: '/:rentOfferId',
      method: HttpMethod.Post,
      handler: this.show,
      middlewares: [
        new ValidateObjectIdMiddleware('rentOfferId'),
        new DocumentExistsMiddleware(
          this.rentOfferService,
          'RentOffer',
          'rentOfferId'
        ),
      ],
    });

    this.addRoute({
      path: '/:rentOfferId',
      method: HttpMethod.Patch,
      handler: this.update,
      middlewares: [
        new ValidateObjectIdMiddleware('rentOfferId'),
        new ValidateDtoMiddleware(PatchRentOfferDto),
        new DocumentExistsMiddleware(
          this.rentOfferService,
          'RentOffer',
          'rentOfferId'
        ),
      ],
    });

    this.addRoute({
      path: '/:rentOfferId',
      method: HttpMethod.Delete,
      handler: this.delete,
      middlewares: [
        new ValidateObjectIdMiddleware('rentOfferId'),
        new DocumentExistsMiddleware(
          this.rentOfferService,
          'RentOffer',
          'rentOfferId'
        ),
      ],
    });

    this.addRoute({
      path: '/:rentOfferId/comments',
      method: HttpMethod.Get,
      handler: this.getComments,
      middlewares: [
        new ValidateObjectIdMiddleware('rentOfferId'),
        new DocumentExistsMiddleware(
          this.rentOfferService,
          'RentOffer',
          'rentOfferId'
        ),
      ],
    });

    this.addRoute({
      path: 'city/:city/premium',
      method: HttpMethod.Get,
      handler: this.getCityPremium,
    });
  }

  public async create(
    { body }: CreateRentOfferRequest,
    res: Response
  ): Promise<void> {
    const result = await this.rentOfferService.create(body);
    const rentOffer = await this.rentOfferService.findById(result.id);
    this.created(res, fillDTO(RentOfferRdo, rentOffer));
  }

  public async index(
    _req: Request<unknown, unknown, unknown, RequestQuery>,
    res: Response
  ): Promise<void> {
    const rentOffers = await this.rentOfferService.find(_req.query.limit);
    this.ok(res, fillDTO(RentOfferResponseRdo, rentOffers));
  }

  public async show(
    { params }: Request<ParamRentOfferId>,
    res: Response
  ): Promise<void> {
    const { rentOfferId } = params;
    const result = await this.rentOfferService.findById(rentOfferId);
    this.ok(res, fillDTO(RentOfferResponseRdo, result));
  }

  public async update(
    { body, params }: UpdateRentOfferRequest,
    res: Response
  ): Promise<void> {
    const updatedRentOffer = await this.rentOfferService.patch(
      params.rentOfferId,
      body
    );

    this.created(res, fillDTO(RentOfferRdo, updatedRentOffer));
  }

  public async delete(
    { params }: Request<ParamRentOfferId>,
    res: Response
  ): Promise<void> {
    const { rentOfferId } = params;
    const rentOffer = await this.rentOfferService.delete(rentOfferId);
    this.noContent(res, rentOffer);
  }

  public async getComments(
    { params }: Request<ParamRentOfferId>,
    res: Response
  ): Promise<void> {
    const comments = await this.commentService.findByRentOfferId(
      params.rentOfferId
    );
    this.ok(res, fillDTO(CommentRdo, comments));
  }

  public async getCityPremium(
    { params }: Request<ParamsCity>,
    res: Response
  ): Promise<void> {
    const offers = await this.rentOfferService.findPremiumByCity(params.city);
    this.ok(res, fillDTO(RentOfferResponseRdo, offers));
  }
}
