import { useState } from 'react';
import { GableRating } from '@/components/GableRating';
import type { Entry, RestaurantEntry, ArtEntry, TourEntry } from '@/lib/types';

interface EntryFormProps {
  entry?: Entry;
  mode: 'create' | 'edit';
}

type EntryType = 'restaurant' | 'art' | 'tour';

const typeLabels = {
  restaurant: 'Restaurant',
  art: 'Kunst',
  tour: 'Tour',
};

const difficultyOptions = [
  { value: '', label: 'Keine Angabe' },
  { value: 'leicht', label: 'Leicht' },
  { value: 'mittel', label: 'Mittel' },
  { value: 'schwer', label: 'Schwer' },
];

const priceRangeOptions = [
  { value: '', label: 'Keine Angabe' },
  { value: '€', label: '€ — Günstig' },
  { value: '€€', label: '€€ — Mittel' },
  { value: '€€€', label: '€€€ — Gehoben' },
  { value: '€€€€', label: '€€€€ — Luxus' },
];

/**
 * Normalize date to YYYY-MM-DD format for HTML date input
 */
function normalizeDate(date: string | Date | undefined): string {
  if (!date) return new Date().toISOString().split('T')[0];
  if (date instanceof Date) return date.toISOString().split('T')[0];
  if (typeof date === 'string' && date.includes('T')) return date.split('T')[0];
  return date;
}

export function EntryForm({ entry, mode }: EntryFormProps) {
  const [type, setType] = useState<EntryType>(entry?.type || 'restaurant');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cuisineInput, setCuisineInput] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: entry?.name || '',
    date: normalizeDate(entry?.date),
    status: entry?.status || 'draft',
    rating: entry?.rating || 3,
    content: entry?.content || '',
    // Restaurant specific
    cuisine: (entry as RestaurantEntry)?.cuisine || [],
    price_range: (entry as RestaurantEntry)?.price_range || '',
    address: (entry as RestaurantEntry)?.address || '',
    ratings: (entry as RestaurantEntry)?.ratings || {
      service: 3,
      food: 3,
      ambiance: 3,
      value: 3,
    },
    // Art specific
    museum: (entry as ArtEntry)?.museum || '',
    exhibition_start: (entry as ArtEntry)?.exhibition_start || '',
    exhibition_end: (entry as ArtEntry)?.exhibition_end || '',
    // Tour specific
    distance_km: (entry as TourEntry)?.distance_km || '',
    duration: (entry as TourEntry)?.duration || '',
    difficulty: (entry as TourEntry)?.difficulty || '',
    // Common
    link: entry?.link || '',
    seo_description: entry?.seo_description || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        type,
        name: formData.name,
        date: formData.date,
        status: formData.status,
        rating: formData.rating,
        content: formData.content,
        link: formData.link || undefined,
        seo_description: formData.seo_description || undefined,
      };

      // Add type-specific fields
      if (type === 'restaurant') {
        payload.cuisine = formData.cuisine;
        payload.price_range = formData.price_range || undefined;
        payload.address = formData.address || undefined;
        payload.ratings = formData.ratings;
      } else if (type === 'art') {
        payload.museum = formData.museum;
        payload.exhibition_start = formData.exhibition_start || undefined;
        payload.exhibition_end = formData.exhibition_end || undefined;
      } else if (type === 'tour') {
        payload.distance_km = formData.distance_km ? Number(formData.distance_km) : undefined;
        payload.duration = formData.duration || undefined;
        payload.difficulty = formData.difficulty || undefined;
      }

      const url = mode === 'create'
        ? '/api/entries'
        : `/api/entries/${entry?.type}/${entry?.slug}`;

      const response = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Fehler beim Speichern');
      }

      const result = await response.json();

      // Redirect to entry list or edit page
      window.location.href = mode === 'create'
        ? `/admin/entries/${result.type}/${result.slug}`
        : '/admin/entries';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  const updateRating = (field: string, value: number) => {
    if (field === 'rating') {
      setFormData((prev) => ({ ...prev, rating: value }));
    } else {
      setFormData((prev) => ({
        ...prev,
        ratings: { ...prev.ratings, [field]: value },
      }));
    }
  };

  const difficultyLabels: Record<string, string> = { leicht: 'Leicht', mittel: 'Mittel', schwer: 'Schwer' };
  const autoSeoDescription = type === 'restaurant'
    ? `${formData.name || 'Name'} - Küche: ${formData.cuisine.length ? formData.cuisine.join(', ') : '...'} - Restaurant mit ${formData.rating} Giebeln bewertet. ${formData.address || ''}`.trim()
    : type === 'art'
    ? `${formData.name || 'Name'} im ${formData.museum || '...'} - Ausstellung mit ${formData.rating} Giebeln bewertet.`
    : `${formData.name || 'Name'} - Tour mit ${formData.rating} Giebeln bewertet.${[formData.distance_km && `${formData.distance_km} km`, formData.duration, formData.difficulty && difficultyLabels[formData.difficulty]].filter(Boolean).join(', ') || ''}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Type selection (only for create mode) */}
      {mode === 'create' && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Typ</label>
          <div className="flex gap-2">
            {(['restaurant', 'art', 'tour'] as EntryType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  type === t
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {typeLabels[t]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Basic fields */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Name *
          </label>
          <input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
            placeholder={type === 'restaurant' ? 'z.B. Mälzer Brau- und Tafelhaus' : type === 'art' ? 'z.B. Caspar David Friedrich' : 'z.B. Wilseder Berg Rundweg'}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="date" className="text-sm font-medium">
            Datum *
          </label>
          <input
            id="date"
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium">
            Status *
          </label>
          <select
            id="status"
            required
            value={formData.status}
            onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as 'draft' | 'active' | 'inactive' }))}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
          >
            <option value="draft">Entwurf</option>
            <option value="active">Aktiv</option>
            <option value="inactive">Inaktiv</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="link" className="text-sm font-medium">
            Website (optional)
          </label>
          <input
            id="link"
            type="url"
            value={formData.link}
            onChange={(e) => setFormData((prev) => ({ ...prev, link: e.target.value }))}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
            placeholder="https://..."
          />
        </div>
      </div>

      {/* Type-specific fields */}
      {type === 'restaurant' && (
        <div className="space-y-6 rounded-lg border p-6">
          <h3 className="font-semibold">Restaurant Details</h3>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="cuisine" className="text-sm font-medium">
                Küche *
              </label>
              <div className="flex flex-wrap gap-2">
                {formData.cuisine.map((c, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                  >
                    {c}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          cuisine: prev.cuisine.filter((_, idx) => idx !== i),
                        }))
                      }
                      className="ml-1 text-primary/60 hover:text-primary"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                id="cuisine"
                type="text"
                value={cuisineInput}
                onChange={(e) => setCuisineInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    const val = cuisineInput.trim();
                    if (val && !formData.cuisine.includes(val)) {
                      setFormData((prev) => ({
                        ...prev,
                        cuisine: [...prev.cuisine, val],
                      }));
                    }
                    setCuisineInput('');
                  }
                }}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                placeholder={formData.cuisine.length === 0 ? 'z.B. Deutsch, Italienisch — Enter zum Hinzufügen' : 'Weitere Küche hinzufügen…'}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="address" className="text-sm font-medium">
                Adresse (optional)
              </label>
              <input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                placeholder="Straße, PLZ Ort"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="price_range" className="text-sm font-medium">
                Preisspanne (optional)
              </label>
              <select
                id="price_range"
                value={formData.price_range}
                onChange={(e) => setFormData((prev) => ({ ...prev, price_range: e.target.value }))}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
              >
                {priceRangeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Bewertungen</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { key: 'service', label: 'Service' },
                { key: 'food', label: 'Essen' },
                { key: 'ambiance', label: 'Ambiente' },
                { key: 'value', label: 'Preis-Leistung' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm">{label}</span>
                  <RatingInput
                    value={formData.ratings[key as keyof typeof formData.ratings]}
                    onChange={(v) => updateRating(key, v)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {type === 'art' && (
        <div className="space-y-6 rounded-lg border p-6">
          <h3 className="font-semibold">Ausstellung Details</h3>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="museum" className="text-sm font-medium">
                Museum / Galerie *
              </label>
              <input
                id="museum"
                type="text"
                required
                value={formData.museum}
                onChange={(e) => setFormData((prev) => ({ ...prev, museum: e.target.value }))}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                placeholder="z.B. Hamburger Kunsthalle"
              />
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="exhibition_start" className="text-sm font-medium">
                Ausstellung Start (optional)
              </label>
              <input
                id="exhibition_start"
                type="date"
                value={formData.exhibition_start}
                onChange={(e) => setFormData((prev) => ({ ...prev, exhibition_start: e.target.value }))}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="exhibition_end" className="text-sm font-medium">
                Ausstellung Ende (optional)
              </label>
              <input
                id="exhibition_end"
                type="date"
                value={formData.exhibition_end}
                onChange={(e) => setFormData((prev) => ({ ...prev, exhibition_end: e.target.value }))}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      )}

      {type === 'tour' && (
        <div className="space-y-6 rounded-lg border p-6">
          <h3 className="font-semibold">Tour Details</h3>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="distance_km" className="text-sm font-medium">
                Distanz (km)
              </label>
              <input
                id="distance_km"
                type="number"
                step="0.1"
                min="0"
                value={formData.distance_km}
                onChange={(e) => setFormData((prev) => ({ ...prev, distance_km: e.target.value }))}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                placeholder="z.B. 12.5"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="duration" className="text-sm font-medium">
                Dauer
              </label>
              <input
                id="duration"
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData((prev) => ({ ...prev, duration: e.target.value }))}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                placeholder="z.B. 3-4 Stunden"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="difficulty" className="text-sm font-medium">
                Schwierigkeit
              </label>
              <select
                id="difficulty"
                value={formData.difficulty}
                onChange={(e) => setFormData((prev) => ({ ...prev, difficulty: e.target.value }))}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
              >
                {difficultyOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Overall rating */}
      <div className="space-y-4">
        <h3 className="font-semibold">Gesamtbewertung</h3>
        <div className="flex items-center gap-4">
          <RatingInput value={formData.rating} onChange={(v) => updateRating('rating', v)} />
          <span className="text-sm text-muted-foreground">{formData.rating} Giebel</span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <label htmlFor="content" className="text-sm font-medium">
          Beschreibung
        </label>
        <textarea
          id="content"
          rows={8}
          value={formData.content}
          onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
          placeholder="Deine Bewertung und Erfahrungen..."
        />
      </div>

      {/* SEO Description */}
      <div className="space-y-2">
        <label htmlFor="seo_description" className="text-sm font-medium">
          SEO Beschreibung <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <textarea
          id="seo_description"
          rows={2}
          value={formData.seo_description}
          onChange={(e) => setFormData((prev) => ({ ...prev, seo_description: e.target.value }))}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
          placeholder={autoSeoDescription}
        />
        {!formData.seo_description && (
          <p className="text-xs text-muted-foreground">Leer lassen für automatische Generierung.</p>
        )}
      </div>

      {/* Submit buttons */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Speichern...' : mode === 'create' ? 'Erstellen' : 'Speichern'}
        </button>
        <a
          href="/admin/entries"
          className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Abbrechen
        </a>
      </div>
    </form>
  );
}

// Rating input component with clickable gables
function RatingInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const handleClick = (rating: number, isHalf: boolean) => {
    const newValue = isHalf ? rating - 0.5 : rating;
    onChange(newValue);
  };

  const displayValue = hoverValue ?? value;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1" onMouseLeave={() => setHoverValue(null)}>
        {[1, 2, 3, 4, 5].map((rating) => (
          <div key={rating} className="relative h-6 w-6">
            {/* Left half (for half rating) */}
            <button
              type="button"
              className="absolute left-0 top-0 h-full w-1/2 cursor-pointer z-10"
              onMouseEnter={() => setHoverValue(rating - 0.5)}
              onClick={() => handleClick(rating, true)}
              aria-label={`${rating - 0.5} Giebel`}
              title={`${rating - 0.5} Giebel`}
            />
            {/* Right half (for full rating) */}
            <button
              type="button"
              className="absolute right-0 top-0 h-full w-1/2 cursor-pointer z-10"
              onMouseEnter={() => setHoverValue(rating)}
              onClick={() => handleClick(rating, false)}
              aria-label={`${rating} Giebel`}
              title={`${rating} Giebel`}
            />
            {/* Display */}
            <GableIcon filled={displayValue >= rating} half={displayValue === rating - 0.5} />
          </div>
        ))}
        {/* Show current/hover value */}
        <span className="ml-2 min-w-[3rem] text-sm font-medium tabular-nums text-muted-foreground">
          {displayValue.toFixed(1)}
        </span>
      </div>
    </div>
  );
}

// Gable icon for rating input - uses official SVG files
function GableIcon({ filled, half }: { filled: boolean; half: boolean }) {
  if (half) {
    return (
      <img
        src="/gable_half.svg"
        alt=""
        className="h-6 w-auto drop-shadow-sm"
      />
    );
  }

  return (
    <img
      src={filled ? '/gable.svg' : '/gable_empty.svg'}
      alt=""
      className={`h-6 w-auto ${filled ? 'drop-shadow-sm' : ''}`}
    />
  );
}

export default EntryForm;
