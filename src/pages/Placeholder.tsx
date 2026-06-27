export default function Placeholder({ title }: { title: string }) {
  return (
    <main className="pt-32 pb-24 px-8">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-headline font-extrabold mb-8">{title}</h1>
        <p className="text-on-surface-variant text-lg leading-relaxed">
          This page is currently under construction. Please check back later for more information about ZIMCO's {title.toLowerCase()}.
        </p>
      </div>
    </main>
  );
}
