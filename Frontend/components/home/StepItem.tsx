type StepItemPropsT = {
  number: string;
  title: string;
  description: string;
};

export default function StepItem({
  number,
  title,
  description,
}: StepItemPropsT) {
  return (
    <div>
      <div className="text-4xl font-bold text-primary">{number}</div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
