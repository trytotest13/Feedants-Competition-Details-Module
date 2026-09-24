import { isValidObjectId, Types } from 'mongoose';
import { ApiError } from '../utils/ApiError';
import { Competition, CompetitionDocument } from '../models/Competition';

/** Resolve a competition by ObjectId or slug; 404 when missing. */
export async function findCompetition(idOrSlug: string): Promise<CompetitionDocument> {
  const filter = isValidObjectId(idOrSlug)
    ? { _id: new Types.ObjectId(idOrSlug) }
    : { slug: idOrSlug.toLowerCase() };
  const comp = await Competition.findOne(filter);
  if (!comp) throw ApiError.notFound('Competition not found');
  return comp;
}
