import {
    Injectable,
    NestMiddleware,
} from '@nestjs/common';

@Injectable()
export class LoggerMiddleware
    implements NestMiddleware {

    use(req, res, next) {

        console.log(req.method);

        console.log(req.originalUrl);

        next();

    }

}