import { ROLES } from '../../constants/roles';
import { colors } from '../../theme/tokens';

// Card copy/marks for the "who are you" sub-role screen, keyed by the
// top-level auth category (customer vs operational).
export const WHO_SCREEN = {
  customer: {
    title: 'What kind of customer?',
    subtitle: 'Choose the account that fits how you use Looppr.',
    options: [
      {
        role: ROLES.RESIDENTIAL,
        label: 'Residential',
        desc: 'Book laundry pickup & delivery for your home.',
        mark: 'R',
        bg: colors.tint,
        c: colors.brandDeep,
      },
      {
        role: ROLES.BUSINESS,
        label: 'Business',
        desc: 'Airbnbs, gyms, salons — commercial rates & invoicing.',
        mark: 'B',
        bg: colors.warnBg,
        c: colors.warnText,
      },
    ],
  },
  operational: {
    title: 'What do you do at Looppr?',
    subtitle: 'Choose your operational role.',
    options: [
      {
        role: ROLES.PARTNER,
        label: 'Laundry Partner',
        desc: 'Run the wash floor — accept jobs, track the queue, get paid.',
        mark: 'LP',
        bg: colors.successBg,
        c: colors.success,
      },
      {
        role: ROLES.DRIVER,
        label: 'Driver',
        desc: "Today's stops, one button per stop — pickups & deliveries.",
        mark: 'D',
        bg: colors.dangerBg,
        c: colors.danger,
      },
    ],
  },
};

export const AUTH_ROLE_COPY = {
  [ROLES.RESIDENTIAL]: { mark: 'R', bg: colors.tint, c: colors.brandDeep, desc: 'Book laundry services for your home.' },
  [ROLES.BUSINESS]: { mark: 'B', bg: colors.warnBg, c: colors.warnText, desc: 'Manage properties, invoicing, and recurring service.' },
  [ROLES.PARTNER]: { mark: 'LP', bg: colors.successBg, c: colors.success, desc: 'Manage your facility queue and payouts.' },
  [ROLES.DRIVER]: { mark: 'D', bg: colors.dangerBg, c: colors.danger, desc: "Run today's route, stop by stop." },
};
