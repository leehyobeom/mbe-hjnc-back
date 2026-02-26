import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class PlanService {
    constructor(private readonly dataSource: DataSource) { }

    async getTopPlans(limit: number = 1000) {
        const result = await this.dataSource.query(`
      SELECT TOP (${limit})
        [VSL_CD],
        [CALL_YEAR],
        [CALL_SEQ],
        [CNTR_NO],
        [CNTR_UID],
        [JOB_TYPE],
        [EQU_NO],
        [WK_SEQ],
        [PLAN_SEQ],
        [HATCH_SEQ],
        [BAY],
        [ROWW],
        [TIER],
        [HD],
        [TWINLIFT_CHK],
        [FE],
        [CARGO_TYPE],
        [ISO],
        [SZTP],
        [CONTYPE],
        [HEIGHT],
        [WGT],
        [OV_HEIGHT],
        [OV_PORT],
        [OV_STBD],
        [CONFIRM_TIME],
        [update_time]
      FROM [HJNC].[dbo].[HT_IT_IF_QC_PLAN]
    `);

        return result;
    }
}