"""
Points engine for MaskOff Poker.

Verified formula reverse-engineered from the club's CSV data:

STANDARD (Thu / Fri / Sun):
  base = (total_players - position + 1) * 5
  if position <= 10:  bonus = (11 - position) * 50   → 500, 450 ... 50
  elif position <= 18: bonus = 50
  else: bonus = 0
  total = base + bonus

DOUBLE RATING (Wed):
  same formula but base = (total_players - position + 1) * 10
  bonuses unchanged

BOUNTY (Sat):
  same as STANDARD + (knockouts * 20)

HIGH ROLLER (Tue):
  fixed ladder — position 1..30 have explicit values,
  positions 31+ get 0 points
"""

HIGH_ROLLER_LADDER = {
    1:  1000,
    2:  850,
    3:  750,
    4:  680,
    5:  620,
    6:  570,
    7:  530,
    8:  500,
    9:  470,
    10: 450,
    11: 430,
    12: 415,
    13: 400,
    14: 385,
    15: 370,
    16: 355,
    17: 340,
    18: 325,
    19: 310,
    20: 295,
    21: 280,
    22: 265,
    23: 250,
    24: 240,
    25: 230,
    26: 220,
    27: 215,
    28: 210,
    29: 205,
    30: 200,
}


def _position_bonus(position: int) -> int:
    if position <= 10:
        return (11 - position) * 50
    elif position <= 18:
        return 50
    return 0


def calculate_points(
    position: int,
    total_players: int,
    tournament_type: str,
    knockouts: int = 0
) -> int:
    """
    tournament_type values:
      "standard"      — Thu, Fri, Sun
      "double"        — Wed (double rating points day)
      "bounty"        — Sat (bounty day, knockouts count)
      "high_roller"   — Tue (fixed ladder)
    """
    if tournament_type == "high_roller":
        return HIGH_ROLLER_LADDER.get(position, 0)

    if tournament_type == "double":
        base = (total_players - position + 1) * 10
    else:
        base = (total_players - position + 1) * 5

    bonus = _position_bonus(position)
    ko_points = knockouts * 20 if tournament_type == "bounty" else 0

    return base + bonus + ko_points


def get_tournament_type_for_date(date) -> str:
    """
    Returns the tournament type string based on weekday.
    date should be a datetime.date or datetime.datetime object.

    Monday:    no games
    Tuesday:   high_roller
    Wednesday: double
    Thursday:  standard
    Friday:    standard
    Saturday:  bounty
    Sunday:    standard
    """
    weekday = date.weekday()
    mapping = {
        0: None,         # Monday — no games
        1: "high_roller",
        2: "double",
        3: "standard",
        4: "standard",
        5: "bounty",
        6: "standard",
    }
    return mapping.get(weekday)


def has_ante_for_date(date) -> bool:
    """
    Ante on all days except Sunday.
    """
    return date.weekday() != 6  # 6 = Sunday