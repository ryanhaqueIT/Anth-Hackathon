#!/usr/bin/env bash
# Fetch Melbourne Open Data exports for the Anth-Hackathon prep workspace.
# Uses the Opendatasoft v2.1 exports/json endpoint, which returns the full
# dataset as a JSON array (including geo_shape / geo_point_2d where present).
set -euo pipefail

BASE="https://data.melbourne.vic.gov.au/api/explore/v2.1/catalog/datasets"
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

# slug | output filename
DATASETS=(
  "free-and-cheap-support-services-with-opening-hours-public-transport-and-parking-|support_services_helping_out.json"
  "landmarks-and-places-of-interest-including-schools-theatres-health-services-spor|landmarks_places_of_interest.json"
  "older-people-profile-2016-60-years-and-over|older_people_profile_2016.json"
  "residents-profiles-by-clue-small-area|residents_profiles_clue_small_area.json"
  "multicultural-community-profile-2016|multicultural_community_profile_2016.json"
  "social-indicators-for-city-of-melbourne-residents-2023|social_indicators_residents_2023.json"
  "city-of-melbourne-liveability-and-social-indicators|liveability_and_social_indicators.json"
  "indicators-of-wellbeing-by-year-future-melbourne|indicators_of_wellbeing.json"
  "postcodes|postcodes.json"
  "small-areas-for-census-of-land-use-and-employment-clue|small_areas_clue.json"
  "city-of-melbourne-population-forecasts-by-small-area-2020-2040|population_forecasts_small_area.json"
  "pedestrian-network|pedestrian_network.json"
  "footpath-steepness|footpath_steepness.json"
  "tactile-ground-surface-indicator|tactile_ground_surface_indicator.json"
  "bus-stops|bus_stops.json"
  "tram-tracks|tram_tracks.json"
  "city-circle-tram-stops|city_circle_tram_stops.json"
  "pedestrian-counting-system-sensor-locations|pedestrian_sensor_locations.json"
  "playgrounds|playgrounds.json"
  "public-barbecues|public_barbecues.json"
  "drinking-fountains|drinking_fountains.json"
  "public-toilets|public_toilets.json"
  "self-guided-walks|self_guided_walks.json"
  "venues-for-event-bookings|venues_for_event_bookings.json"
  "melbourne-conversations-past-events-2001-2017|melbourne_conversations_past_events.json"
)

for entry in "${DATASETS[@]}"; do
  slug="${entry%%|*}"
  out="${entry##*|}"
  if [[ -s "$out" ]]; then
    printf '[skip] %-55s -> %s (already exists, %s bytes)\n' "$slug" "$out" "$(wc -c < "$out" | tr -d ' ')"
    continue
  fi
  printf '[get ] %-55s -> %s\n' "$slug" "$out"
  curl -sS --fail --compressed -o "$out.tmp" "$BASE/$slug/exports/json" \
    && mv "$out.tmp" "$out" \
    && printf '       %s bytes\n' "$(wc -c < "$out" | tr -d ' ')" \
    || { echo "       FAILED"; rm -f "$out.tmp"; }
done

# Pedestrian counts: 1.57M rows full export is unwieldy; pull the last 30 days
# Schema: id, location_id, sensing_date (date), hourday, direction_1/2,
# pedestriancount, sensor_name, location {lon,lat}.
PED_OUT="pedestrian_counts_last_30d.json"
if [[ ! -s "$PED_OUT" ]]; then
  printf '[get ] %-55s -> %s\n' "pedestrian-counting-system (last 30d)" "$PED_OUT"
  curl -sS --fail --compressed -o "$PED_OUT.tmp" \
    "$BASE/pedestrian-counting-system-monthly-counts-per-hour/exports/json?where=sensing_date%20%3E%20date%272026-04-23%27" \
    && mv "$PED_OUT.tmp" "$PED_OUT" \
    && printf '       %s bytes\n' "$(wc -c < "$PED_OUT" | tr -d ' ')" \
    || { echo "       FAILED"; rm -f "$PED_OUT.tmp"; }
else
  printf '[skip] %-55s -> %s\n' "pedestrian-counting-system (last 30d)" "$PED_OUT"
fi
