import eldcarelogohori from "../../../public/eldcarelogohori.png";

const HeroSection = () => {
  return (
    <section className="relative h-[50vh] min-h-[50vh] w-full">
      <div className="relative flex h-full w-full flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-1 py-4">
          <img src={eldcarelogohori} width="60%"/>
          <h2 className="text-blue-900 font-light">Helping elderly manage medication</h2>
          <h2 className="text-blue-900 font-light">easily and safely</h2>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
