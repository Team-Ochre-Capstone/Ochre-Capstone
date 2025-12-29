import React from "react";

export default function AboutPage(): JSX.Element {
	return (
		<main className="max-w-4xl mx-auto p-8">
            <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-3xl font-semibold mb-4">Medical CT-Scan 3D Printing</h2>

                <p className="mb-6">University of Maine - Capstone Project</p>

                <section className="mb-6">
                    <h3 className="text-2xl font-semibold mb-2">Group Members</h3>
                    <ul className="list-disc ml-6">
                        <li>Israk Arafat</li>
                        <li>Gregory Michaud</li>
                        <li>Cooper Stepankiw</li>
                        <li>Bryan Sturdivant</li>
                        <li>Ethan Wyman</li>
                    </ul>
                </section>
                <section className="mb-6">
                    <h3 className="text-2xl font-semibold mb-2">Client</h3>
                    <ul className="list-disc ml-6">
                        <li>Terry Yoo; Laboratory for Convergent Science</li>
                    </ul>
                </section>
                <section className="mb-6">
                    <h3 className="text-2xl font-semibold mb-2">Project Title</h3>
                    <p>AnaToPrint: Medical CT 3D Printing — converting CT DICOM stacks to STL for 3D viewing and printing.</p>
                </section>

                <section className="mb-6">
                    <h3 className="text-2xl font-semibold mb-2">Importance</h3>
                    <p>
                        This project enables clinicians, researchers, patients, and educators to quickly 
                        convert medical CT data into 3D-printable models for surgical planning,
                        patient education, and research. It allows for interactivity with a 3D preview of the anatomy. 
                        It focuses on accessibility, data
                        privacy, and producing reliable STL exports from DICOM volumes, with GCode export coming soon.
                    </p>
                </section>
                <section className = "mb-6">
                    <h3 className="text-2xl font-semibold mb-2">Versions</h3>
                    <ul className="list-disc ml-6">
                        <li>1.0 (current) </li>
                    </ul>
                </section>


            </div>
		</main>
	);
}
