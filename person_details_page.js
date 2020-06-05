/**
 * Contains data and functions specific to the person details page.
 *
 */

E.personDetails = {
    /**
     * Calls the person details API and fills the page with the response.
     *
     * @param eniroId required.
     * @param region required.
     */
    populate: E.details.populate.curry(E.comm.personDetails,
        E.translate.personDetails, E.generate.personDetails)
};
