import { z } from "zod";

import {
  Connection,
  ObjectPosition,
} from "@/app/[lng]/automl/data/fusion/[id]/_components/schema";

// -------------------- Data Fusion & Metadata --------------------

export const SaveDataFusionSchema = z.object({
  fusion_id: z.number(),
  target_dataset_id: z.number(),
  dataset_ids: z.array(z.string()),
  primary_keys: z.array(z.string()),
  relationships: z.array(z.custom<Connection>()),
  position: z.array(z.custom<ObjectPosition>()),
});

export const ViewDataFusionSchema = z.object({
  fusion_id: z.number(),
  target_dataset_id: z.number(),
  dataset_ids: z.string(),
  primary_keys: z.string(),
  relationships: z.string(),
  position: z.string(),
});

export const GenerateMetadataPrompt = z.object({
  dataset_id: z.number(),
  target_column: z.string(),
  force: z.optional(z.boolean()),
});

// -------------------- Core Enums & Base Types --------------------

export const DataQualityTypeSchema = z.enum(["High", "Medium", "Low"]);
export type DataQualityType = z.infer<typeof DataQualityTypeSchema>;

export const OverallQualitySchema = z.enum(["Good", "Bad"]);
export type OverallQuality = z.infer<typeof OverallQualitySchema>;

export const MLTaskSchema = z.enum(["REGRESSION", "CLASSIFICATION"]);
export type MLTask = z.infer<typeof MLTaskSchema>;

export const DCMissingValuesImputationSchema = z.enum([
  "Mean",
  "Median",
  "Mode",
  "Drop",
]);
export type DCMissingValuesImputation = z.infer<
  typeof DCMissingValuesImputationSchema
>;

export const DCSamplingSchema = z.enum(["Upsampling", "Downsampling"]);
export type DCSampling = z.infer<typeof DCSamplingSchema>;

export const FEIndexingOrEncodingSchema = z.enum(["OneHot", "Label"]);
export type FEIndexingOrEncoding = z.infer<typeof FEIndexingOrEncodingSchema>;

export const FETransformationSchema = z.enum(["Log", "Sqrt"]);
export type FETransformation = z.infer<typeof FETransformationSchema>;

export const FEExtractionSchema = z.enum(["PCA", "ICA"]);
export type FEExtraction = z.infer<typeof FEExtractionSchema>;

export const CrossValidationMethodSchema = z.enum(["KFold", "StratifiedKFold"]);
export type CrossValidationMethod = z.infer<typeof CrossValidationMethodSchema>;

export const EvaluationMetricSchema = z.enum(["Accuracy", "F1Score", "MSE"]);
export type EvaluationMetric = z.infer<typeof EvaluationMetricSchema>;

// -------------------- Data Quality Reporting --------------------

export const IssueSchema = z.object({
  type: DataQualityTypeSchema,
  columns: z.array(z.string()),
  description: z.string(),
});
export type Issue = z.infer<typeof IssueSchema>;

export const StrengthSchema = z.object({
  type: DataQualityTypeSchema,
  description: z.string(),
});
export type Strength = z.infer<typeof StrengthSchema>;

export const DataQualityReportSchema = z.object({
  overall_quality: OverallQualitySchema,
  summary: z.string(),
  issues: z.array(IssueSchema),
  strengths: z.array(StrengthSchema),
});
export type DataQualityReport = z.infer<typeof DataQualityReportSchema>;

// -------------------- Data Cleaning Recommendations --------------------

export const MissingValueRecommendationSchema = z.object({
  column: z.string(),
  methods: z.array(DCMissingValuesImputationSchema),
});
export type MissingValueRecommendation = z.infer<
  typeof MissingValueRecommendationSchema
>;

export const SamplingRecommendationSchema = z.object({
  column: z.string(),
  methods: z.array(DCSamplingSchema),
});
export type SamplingRecommendation = z.infer<
  typeof SamplingRecommendationSchema
>;

export const DataCleaningRecommendationsSchema = z.object({
  missing_values: z.array(MissingValueRecommendationSchema),
  sampling: z.array(SamplingRecommendationSchema),
});
export type DataCleaningRecommendations = z.infer<
  typeof DataCleaningRecommendationsSchema
>;

// -------------------- Feature Engineering Recommendations --------------------

export const IndexingOrEncodingRecommendationSchema = z.object({
  column: z.string(),
  methods: z.array(FEIndexingOrEncodingSchema),
});
export type IndexingOrEncodingRecommendation = z.infer<
  typeof IndexingOrEncodingRecommendationSchema
>;

export const TransformationRecommendationSchema = z.object({
  column: z.string(),
  methods: z.array(FETransformationSchema),
});
export type TransformationRecommendation = z.infer<
  typeof TransformationRecommendationSchema
>;

export const FeatureExtractionRecommendationSchema = z.object({
  column: z.string(),
  methods: z.array(FEExtractionSchema),
});
export type FeatureExtractionRecommendation = z.infer<
  typeof FeatureExtractionRecommendationSchema
>;

export const FeatureEngineeringRecommendationsSchema = z.object({
  encoding: z.array(IndexingOrEncodingRecommendationSchema),
  transformation: z.array(TransformationRecommendationSchema),
  extraction: z.array(FeatureExtractionRecommendationSchema),
});
export type FeatureEngineeringRecommendations = z.infer<
  typeof FeatureEngineeringRecommendationsSchema
>;

// -------------------- Modeling & Algorithms --------------------

export const RecommendedAlgorithmSchema = z.object({
  name: z.string(),
  reason: z.string(),
  params: z.record(z.string(), z.unknown()),
});
export type RecommendedAlgorithm = z.infer<typeof RecommendedAlgorithmSchema>;

export const CrossValidationSchema = z.object({
  method: CrossValidationMethodSchema,
  folds: z.number().int(),
  stratified: z.boolean(),
});
export type CrossValidation = z.infer<typeof CrossValidationSchema>;

export const ModelingApproachSchema = z.object({
  task_type: MLTaskSchema,
  target: z.string(),
  recommended_algorithm: RecommendedAlgorithmSchema,
  evaluation_metrics: z.array(EvaluationMetricSchema),
  cross_validation: CrossValidationSchema,
  data_cleaning: DataCleaningRecommendationsSchema,
  feature_engineering: FeatureEngineeringRecommendationsSchema,
  test_size: z.number(),
  validation_size: z.number(),
});
export type ModelingApproach = z.infer<typeof ModelingApproachSchema>;

export const LLMResponseSchema = z.object({
  data_quality_report: DataQualityReportSchema,
  modeling_approaches: z.array(ModelingApproachSchema),
});
export type LLMResponse = z.infer<typeof LLMResponseSchema>;

// -------------------- Processing Options & Applier --------------------

export const ChoosedMethodsSchema = z.record(
  z.coerce.number(),
  z.array(z.boolean()),
);
export type ChoosedMethods = z.infer<typeof ChoosedMethodsSchema>;

export const DataCleaningOptionsSchema = z.object({
  // Key represents the recommendation index; Value represents chosen methods
  missing_values: ChoosedMethodsSchema.optional(),
  sampling: ChoosedMethodsSchema.optional(),
});
export type DataCleaningOptions = z.infer<typeof DataCleaningOptionsSchema>;

export const FeatureEngineeringOptionsSchema = z.object({
  transformation: ChoosedMethodsSchema.optional(),
  encoding: ChoosedMethodsSchema.optional(),
  extraction: ChoosedMethodsSchema.optional(),
});
export type FeatureEngineeringOptions = z.infer<
  typeof FeatureEngineeringOptionsSchema
>;

export const TaskOptionsSchema = z.object({
  type: MLTaskSchema,
  discretize: z.boolean(),
  bins_or_quantiles: z.array(z.number()).optional(),
  labels: z.array(z.string()).optional(),
});
export type TaskOptions = z.infer<typeof TaskOptionsSchema>;

export const ApplierProcessingBodySchema = z.object({
  only_cleaning: z.boolean().optional(),
  data_cleaning_options: DataCleaningOptionsSchema.optional(),
  feature_engineering_options: FeatureEngineeringOptionsSchema.optional(),
  task_options: TaskOptionsSchema.optional(),
});
export type ApplierProcessingBody = z.infer<typeof ApplierProcessingBodySchema>;
