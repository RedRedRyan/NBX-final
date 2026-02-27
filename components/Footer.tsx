import Link from "next/link";

const Footer = () => {
  return (
    <footer className="relative mt-8 border-t border-border/70 bg-gradient-to-r from-black via-[#141414] to-black">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 md:grid-cols-2 md:px-10">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-light-200">Nairobi Block Exchange</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Building Africa&apos;s Capital Markets for Everyone</h2>
          <p className="mt-2 text-sm text-light-200">NBX Company Survey is available in the questionnaire link.</p>
        </div>
        <div className="md:text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-light-200">Questionnaire</p>
          <Link
            href="https://forms.gle/aHsL3MHpL31zL1gd9"
            className="mt-3 inline-flex items-center rounded-full border border-primary/60 bg-primary/10 px-5 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
          >
            Open NBX Company Survey
          </Link>
          <p className="mt-3 text-xs text-light-200">www.nbx-exchange.co.ke | info@nbx-exchange.co.ke</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
