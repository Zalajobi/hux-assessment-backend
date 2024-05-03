import { z } from 'zod';
import {bearerTokenSchema, ONE_MILLION, SortModelSchema} from "@schemas/commonSchemas";

export const SearchContactsRequestSchema = bearerTokenSchema.extend({
  query: z.string().optional(),
  id: z.string().optional(),
  userId: z.string().optional(),
  label: z.enum(['ALL', 'MOBILE', 'WORK', 'HOME', 'MAIN', 'WORK_FAX', 'HOME_FAX', 'PAGER', 'OTHERS']).default('ALL').transform((value) => {
    if (value === 'ALL') {
      return undefined;
    }
    return value;
  }),
  sortModel: SortModelSchema.default({
    sort: 'desc',
    colId: 'created_at',
  }),
  startRow: z.coerce.number().min(0).max(ONE_MILLION).default(0),
  endRow: z.coerce.number().min(0).max(ONE_MILLION).default(10),
}).refine((data) => data.endRow > data.startRow, {
  message: 'endRow must be greater than startRow',
  path: ['endRow'],
});

export const GetContactDetailsRequestSchema = bearerTokenSchema.extend({
  id: z.string(),
});

export const UpdateContactRequestSchema = bearerTokenSchema.extend({
  id: z.string(),
  email: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone: z.string().optional(),
  label: z.enum(['MOBILE', 'WORK', 'HOME', 'MAIN', 'WORK_FAX', 'HOME_FAX', 'PAGER', 'OTHERS']).optional(),
})
