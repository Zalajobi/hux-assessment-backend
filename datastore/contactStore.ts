import {createContactRequestSchema, SearchContactsRequestSchema} from "@schemas/contactsSchemas";
import {z} from "zod";
import {contactRepo} from "@typeorm/repository";
import {extractPerPageAndPage} from "@util/index";
import {Contacts} from "@typeorm/entity/contacts";
import {DefaultJsonResponse} from "@util/responses";

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
    },
    select: {
      id: true,
      email: true,
      first_name: true,
      last_name: true,
      phone: true,
      label: true,
      created_at: true
    }
  });
}

export const deleteContactById = async (id: string) => {
  const contactRepository = contactRepo();

  return await contactRepository.delete({
    id
  });
}

export const updateContactById = async (id:string, data: Object) => {
  const contactRepository = contactRepo();

  const updatedData = await contactRepository.update(
    {
    id
  },
    data
  );

  return DefaultJsonResponse(
    Number(updatedData?.affected) >= 1
      ? 'Contact Successfully Updated'
      : 'Something Went Wrong',
    null,
    Number(updatedData?.affected) >= 1
  );
}

export const createContact = async (data: z.infer<typeof createContactRequestSchema>) => {
  const contactRepository = contactRepo();

  const createdContact = await contactRepository.save(new Contacts(data));

  return DefaultJsonResponse(
    createdContact ? 'Contact Successfully Created' : 'Something Went Wrong',
    null,
    Boolean(createdContact)
  );
}
