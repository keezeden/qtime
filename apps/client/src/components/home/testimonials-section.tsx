import { testimonials } from "./data";

export function TestimonialsSection() {
  return (
    <section className="relative overflow-hidden bg-[#0b0e14] py-24">
      <div className="absolute -left-12 -top-12 h-64 w-64 rounded-full bg-[rgb(255,137,171,0.05)] blur-3xl" />
      <div className="absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-[rgb(38,254,220,0.05)] blur-3xl" />
      <div className="px-6 md:px-20">
        <h2 className="mb-16 text-center font-display text-5xl font-black uppercase italic tracking-tight">
          The Pros Agree...
        </h2>
        <div className="flex flex-wrap justify-center gap-12">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.handle}
              className={`relative max-w-xs transform ${testimonial.rotateClassName} ${testimonial.offsetClassName}`}
            >
              <div
                className={`border-4 bg-[#0b0e14] p-8 ${testimonial.borderClassName} ${testimonial.shadowClassName}`}
              >
                <p className="text-lg font-semibold italic text-[#f3deff]">{testimonial.quote}</p>
                <div className="mt-6 flex items-center gap-3">
                  <div
                    className={`h-10 w-10 overflow-hidden rounded-full border-2 bg-[#22262f] ${testimonial.borderClassName}`}
                  >
                    <img
                      alt={testimonial.imageAlt}
                      className="h-full w-full object-cover"
                      src={testimonial.imageSrc}
                    />
                  </div>
                  <span
                    className={`font-display text-sm font-bold uppercase tracking-tighter ${testimonial.accentClassName}`}
                  >
                    {testimonial.handle}
                  </span>
                </div>
              </div>
              <div
                className={`absolute -bottom-4 left-10 h-8 w-8 rotate-45 border-b-4 border-r-4 bg-[#0b0e14] ${testimonial.borderClassName}`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
