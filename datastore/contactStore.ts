import {SearchContactsRequestSchema} from "@schemas/contactsSchemas";
import {z} from "zod";
import {contactRepo} from "@typeorm/repository";
import {extractPerPageAndPage} from "@util/index";

export const getSearchContactsData = async (requestBody: z.infer<typeof SearchContactsRequestSchema>) => {
  const contactRepository = contactRepo();

  const { page, perPage } = extractPerPageAndPage(requestBody.endRow, requestBody.startRow)

  const contactsQuery = contactRepository.createQueryBuilder('contacts').orderBy({
    [`${requestBody.sortModel.colId}`]:
      requestBody.sortModel.sort === 'asc' ? 'ASC' : 'DESC',
  });

  if (requestBody.userId)
    contactsQuery.where('contacts.userId = :userId', {
      userId: requestBody.userId,
    });

  if (requestBody.id)
    contactsQuery.where('contacts.id = :id', {
      id: requestBody.id,
    });

  if (requestBody.label)
    contactsQuery.andWhere('contacts.label = :label', {
      label: requestBody.label,
    });

  if (requestBody.query) {
    contactsQuery.orWhere('LOWER(contacts.first_name) LIKE :query', {
      query: `%${requestBody.query.toLowerCase()}%`,
    });

    contactsQuery.orWhere('LOWER(contacts.last_name) LIKE :query', {
      query: `%${requestBody.query.toLowerCase()}%`,
    });

    contactsQuery.orWhere('LOWER(contacts.email) LIKE :query', {
      query: `%${requestBody.query.toLowerCase()}%`,
    });

    contactsQuery.orWhere('LOWER(contacts.phone) LIKE :query', {
      query: `%${requestBody.query.toLowerCase()}%`,
    });
  }

  return await contactsQuery
    .skip(perPage * page)
    .take(perPage)
    .getManyAndCount();
}