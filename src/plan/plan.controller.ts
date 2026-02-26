import { Controller, Get, Query } from '@nestjs/common';
import { PlanService } from './plan.service';

@Controller('plan')
export class PlanController {
    constructor(private readonly planService: PlanService) { }

    @Get()
    async getPlans(@Query('limit') limit?: string) {
        const parsedLimit = limit ? parseInt(limit, 10) : 1000;
        return this.planService.getTopPlans(parsedLimit);
    }
}