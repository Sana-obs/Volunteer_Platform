import Typography from "../ui/Typography";

export default function SectionHeader() {
  return (
    <div className="text-center mb-16">
      {/* as="h1": About's primary heading; sectionTitle otherwise defaults to <h2> */}
      <Typography as="h1" variant="sectionTitle" gutterBottom>
        About Volunteer Platform
      </Typography>
      <Typography variant="lead" className="max-w-2xl mx-auto">
        We connect volunteers with organizations making a difference in their communities.
      </Typography>
    </div>
  );
}