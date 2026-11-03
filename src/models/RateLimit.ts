import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

// Fixed-window counter. `_id` is the limiter key (e.g. "login:email:a@b.c").
// The TTL index removes each window automatically once it expires.
const RateLimitSchema = new Schema(
  {
    _id: { type: String },
    count: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { collection: 'rate_limits', versionKey: false },
);

RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type RateLimitDocument = InferSchemaType<typeof RateLimitSchema>;

const RateLimit =
  (mongoose.models.RateLimit as Model<RateLimitDocument> | undefined) ||
  mongoose.model<RateLimitDocument>('RateLimit', RateLimitSchema);

export default RateLimit;
