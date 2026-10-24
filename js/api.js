/*
    SpendWise currently uses LocalStorage and does not call a real API.

    The shared data functions stay in main.js for compatibility with the existing
    USER and COACH pages:
    - getUserData(name, defaultValue)
    - saveUserData(name, value)

    Shared keys follow the group contract:
    transactions -> sw_transactions
    goals -> sw_goals
    resources -> sw_resources
    categories -> sw_categories
    coachNotes -> sw_coachNotes
    budgets -> sw_budgets
    aiTemplates -> sw_aiTemplates
    feedback -> sw_feedback
    notifications -> sw_notifications
    users -> sw_users
    session -> sw_session

    This file deliberately does not define a second read/write API.
*/
