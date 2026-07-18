import {
    Injectable,
    CanActivate,
    ExecutionContext,
} from '@nestjs/common';

@Injectable()
export class RolesGuard
    implements CanActivate {

    canActivate(
        context: ExecutionContext,
    ): boolean {

        return true;
    }

}