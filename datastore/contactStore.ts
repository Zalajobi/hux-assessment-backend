import {SearchContactsRequestSchema} from "@schemas/contactsSchemas";
import {z} from "zod";
import {contactRepo} from "@typeorm/repository";
import {extractPerPageAndPage} from "@util/index";
import {Contacts} from "@typeorm/entity/contacts";

export const getSearchContactsData = async (requestBody: z.infer<typeof SearchContactsRequestSchema>) => {
  const contactRepository = contactRepo();

  const { page, perPage } = extractPerPageAndPage(requestBody.endRow, requestBody.startRow)

  const contactsQuery = contactRepository.createQueryBuilder('contacts').orderBy({
    [`${requestBody.sortModel.colId}`]:
      requestBody.sortModel.sort === 'asc' ? 'ASC' : 'DESC',
  });

  if (requestBody.query) {
    contactsQuery.orWhere('LOWER(contacts.phone) LIKE :query', {
      query: `%${requestBody.query.toLowerCase()}%`,
    });
  }

  if (requestBody.userId)
    contactsQuery.andWhere('contacts.userId = :userId', {
      userId: requestBody.userId,
    });

  if (requestBody.id)
    contactsQuery.andWhere('contacts.id = :id', {
      id: requestBody.id,
    });

  if (requestBody.label)
    contactsQuery.andWhere('contacts.label = :label', {
      label: requestBody.label,
    });

  return await contactsQuery
    .skip(perPage * page)
    .take(perPage)
    .getManyAndCount();
}

export const getContactById = async (id: string):Promise<Contacts | null> => {
  const contactRepository = contactRepo();

  return await contactRepository.findOne({
    where: {
      id
    }
  });
}
