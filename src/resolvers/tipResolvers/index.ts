import { Resolver, Mutation, Args } from "type-graphql";
import { Tip, tipModel } from "../../models/tip";
import createTipInterface from "./interfaces/createTipInterface"
import { createFilters } from "../../utils/reusableSnippets";
import createCRUDResolver from "../globalResolvers/crudBaseResolver";

// Define the prefix of the resolvers
const resolverName = 'Tip'

// Create an enum based on the model indexes
const { textIndexes, regularIndexes } = createFilters(tipModel, resolverName)

// Initialize base CRUD factory
const CRUDTip = createCRUDResolver({
  prefix: resolverName,
  returnType: Tip,
  model: tipModel,
  allowedSearchCriterias: textIndexes,
  allowedSortCriterias: regularIndexes,
  permissions: {
    findById: [`read_all_${resolverName}s`],
    readAll: [`read_all_${resolverName}s`],
    deleteById: [`delete_all_${resolverName}s`]
  }
})

@Resolver(() => Tip)
export default class TipResolvers extends CRUDTip {
  @Mutation(() => Tip)
  createTip (
    @Args() { title, description, department }: createTipInterface
  ): Promise<Tip> {
    return tipModel.create({
      title,
      description,
      department
    })
  }
}