interface link {
  // Identity
  id: string;
  shortCode: string;
  originalUrl: string;

  // Ownership
  userId: string;

  // Customization
  title: string;
  customCode: boolean; // We might be better off withhout this

  // Control
  isActive: boolean; // soft on/off switch
  expiresAt: null; // null = never expires

  // Usage limits (for quota enforcement)
  clickLimit: number | null; // max clicks allowed, null = unlimited

  createdAt: Date;
  updatedAt: Date;
}
